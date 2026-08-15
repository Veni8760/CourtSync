package com.courtsync.dropins.rsvp.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.domain.DropInStatus;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.dropin.service.DropInService;
import com.courtsync.dropins.event.DropinEventPublisher;
import com.courtsync.dropins.event.DropinEvents;
import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.PaymentStatus;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;
import com.courtsync.dropins.rsvp.dto.MyRsvpStatusResponse;
import com.courtsync.dropins.rsvp.dto.RsvpResponse;
import com.courtsync.dropins.rsvp.exception.DuplicateRsvpException;
import com.courtsync.dropins.rsvp.repository.DropInPlayerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * RSVP business logic. Orchestrates across the one-way seam: it asks the dropin
 * feature (DropInService) for a locked drop-in, then mutates the player row and
 * the drop-in's spot counter, and publishes the Kafka event.
 *
 * The whole method is one @Transactional unit: the pessimistic lock taken in
 * lockForUpdate is held until commit, so concurrent RSVPs to the last spot run
 * one-at-a-time. We never call save() on the DropIn — it's a managed entity, so
 * Hibernate's dirty checking flushes reserveSpot()/releaseSpot() changes on commit.
 *
 * The same lock is what makes the waitlist correct. Enqueue reads the queue tail
 * and cancel reads the queue head while holding it, so two players can never take
 * the same spot and two cancellations can never promote the same person twice.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RsvpService {

    private final DropInService dropInService;
    private final DropInPlayerRepository playerRepository;
    private final DropinEventPublisher events;

    /**
     * RSVP the user, or put them on the waitlist if the drop-in is already full.
     * A full drop-in is NOT an error any more — the caller gets back a WAITLISTED
     * row and a position, and is promoted automatically when a spot frees up.
     */
    @Transactional
    public RsvpResponse rsvp(UUID dropInId, UUID userId) {
        DropIn dropIn = dropInService.lockForUpdate(dropInId);

        if (dropIn.getStatus() == DropInStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Drop-in has been cancelled");
        }

        // Re-RSVP after a cancellation reuses the existing row (the UNIQUE
        // constraint forbids a second row for the same user + drop-in).
        DropInPlayer player = playerRepository.findByDropInIdAndUserId(dropInId, userId)
                .orElse(null);
        if (player != null && player.getRsvpStatus() != RsvpStatus.CANCELLED) {
            throw new DuplicateRsvpException(dropInId, userId);
        }
        if (player == null) {
            player = new DropInPlayer();
            player.setDropIn(dropIn);
            player.setUserId(userId);
        }

        return dropIn.hasSpotsLeft()
                ? confirm(dropIn, player)
                : enqueue(dropIn, player);
    }

    /** Take a free spot. The aggregate bumps the counter and flips to FULL on the last one. */
    private RsvpResponse confirm(DropIn dropIn, DropInPlayer player) {
        dropIn.reserveSpot();

        boolean paymentRequired = dropIn.getPrice().compareTo(BigDecimal.ZERO) > 0;
        player.setRsvpStatus(RsvpStatus.CONFIRMED);
        player.setWaitlistedAt(null);
        player.setPaymentStatus(paymentRequired ? PaymentStatus.PENDING : PaymentStatus.NOT_REQUIRED);
        DropInPlayer saved = playerRepository.save(player);

        log.info("RSVP confirmed: dropIn={} user={} ({}/{} spots filled)",
                dropIn.getId(), player.getUserId(), dropIn.getConfirmedPlayers(), dropIn.getMaxPlayers());

        // NOTE (dual-write): publishing to Kafka inside the DB transaction is not
        // truly atomic — a crash between commit and send (or vice-versa) can drift
        // the two. The production fix is the transactional outbox pattern; the
        // skeleton accepts this and publishes here.
        events.publishRsvpCreated(DropinEvents.RsvpCreated.of(
                dropIn.getId(), player.getUserId(), paymentRequired, dropIn.getPrice()));

        return RsvpResponse.from(saved, 0);
    }

    /** Join the back of the queue. No spot is reserved, so confirmed_players is untouched. */
    private RsvpResponse enqueue(DropIn dropIn, DropInPlayer player) {
        Instant now = Instant.now();
        player.setRsvpStatus(RsvpStatus.WAITLISTED);
        player.setWaitlistedAt(now);
        player.setPaymentStatus(PaymentStatus.NOT_REQUIRED); // nothing is owed until promoted
        DropInPlayer saved = playerRepository.save(player);

        int position = positionOf(saved);
        log.info("RSVP waitlisted: dropIn={} user={} position={}",
                dropIn.getId(), player.getUserId(), position);

        events.publishRsvpWaitlisted(DropinEvents.RsvpWaitlisted.of(
                dropIn.getId(), player.getUserId(), position));

        return RsvpResponse.from(saved, position);
    }

    /**
     * Cancel the user's RSVP. Cancelling a CONFIRMED spot frees it and immediately
     * promotes the longest-waiting player; cancelling a WAITLISTED row just leaves
     * the queue, so there is no spot to give away and nobody to promote.
     */
    @Transactional
    public void cancelRsvp(UUID dropInId, UUID userId) {
        DropIn dropIn = dropInService.lockForUpdate(dropInId);

        DropInPlayer player = playerRepository.findByDropInIdAndUserId(dropInId, userId)
                .filter(p -> p.getRsvpStatus() != RsvpStatus.CANCELLED)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No active RSVP for user " + userId));

        boolean heldASpot = player.getRsvpStatus() == RsvpStatus.CONFIRMED;
        player.setRsvpStatus(RsvpStatus.CANCELLED);
        player.setWaitlistedAt(null);
        playerRepository.save(player);

        if (!heldASpot) {
            log.info("Waitlist entry withdrawn: dropIn={} user={}", dropInId, userId);
            events.publishRsvpCancelled(DropinEvents.RsvpCancelled.of(dropInId, userId));
            return;
        }

        // Free the spot on the aggregate; reopens a previously FULL drop-in.
        dropIn.releaseSpot();

        log.info("RSVP cancelled: dropIn={} user={} ({}/{} spots filled)",
                dropInId, userId, dropIn.getConfirmedPlayers(), dropIn.getMaxPlayers());

        events.publishRsvpCancelled(DropinEvents.RsvpCancelled.of(dropInId, userId));

        promoteNextInLine(dropIn);
    }

    /**
     * Move the longest-waiting player into the spot that just opened. Runs inside
     * the caller's transaction and under the same row lock, so the freed spot
     * cannot be taken by a concurrent RSVP before the waitlist gets it.
     */
    private void promoteNextInLine(DropIn dropIn) {
        playerRepository
                .findFirstByDropInIdAndRsvpStatusOrderByWaitlistedAtAsc(dropIn.getId(), RsvpStatus.WAITLISTED)
                .ifPresent(next -> {
                    dropIn.reserveSpot();
                    next.setRsvpStatus(RsvpStatus.CONFIRMED);
                    next.setWaitlistedAt(null);
                    next.setPaymentStatus(dropIn.getPrice().compareTo(BigDecimal.ZERO) > 0
                            ? PaymentStatus.PENDING
                            : PaymentStatus.NOT_REQUIRED);
                    playerRepository.save(next);

                    log.info("Waitlist promoted: dropIn={} user={} ({}/{} spots filled)",
                            dropIn.getId(), next.getUserId(),
                            dropIn.getConfirmedPlayers(), dropIn.getMaxPlayers());

                    events.publishRsvpPromoted(DropinEvents.RsvpPromoted.of(
                            dropIn.getId(), next.getUserId()));
                });
    }

    /**
     * The drop-ins this user is on — confirmed spots and waitlist entries alike. A
     * cross-aggregate read in the allowed direction (rsvp → dropin): the fetched
     * player rows carry their drop-in, which we surface via DropInResponse.
     */
    @Transactional(readOnly = true)
    public List<DropInResponse> myRsvps(UUID userId) {
        return playerRepository
                .findWithDropInByUserIdAndRsvpStatus(userId, RsvpStatus.CONFIRMED).stream()
                .map(p -> DropInResponse.from(p.getDropIn()))
                .toList();
    }

    /** The drop-ins this user is waitlisted for, newest queue entry last. */
    @Transactional(readOnly = true)
    public List<DropInResponse> myWaitlist(UUID userId) {
        return playerRepository
                .findWithDropInByUserIdAndRsvpStatus(userId, RsvpStatus.WAITLISTED).stream()
                .map(p -> DropInResponse.from(p.getDropIn()))
                .toList();
    }

    /**
     * This user's standing on a given drop-in, for rendering one correct action
     * (RSVP / Join waitlist / Cancel) plus their queue position.
     */
    @Transactional(readOnly = true)
    public MyRsvpStatusResponse myStatus(UUID dropInId, UUID userId) {
        return playerRepository.findByDropInIdAndUserId(dropInId, userId)
                .filter(p -> p.getRsvpStatus() != RsvpStatus.CANCELLED)
                .map(p -> new MyRsvpStatusResponse(
                        p.getRsvpStatus() == RsvpStatus.CONFIRMED,
                        p.getRsvpStatus(),
                        positionOf(p)))
                .orElseGet(MyRsvpStatusResponse::none);
    }

    /**
     * Derived queue position, 1-based; 0 for anyone not waitlisted. Counting the
     * rows that joined earlier is what lets us skip a stored position column and
     * the renumbering it would need on every promotion.
     */
    private int positionOf(DropInPlayer player) {
        if (player.getRsvpStatus() != RsvpStatus.WAITLISTED) {
            return 0;
        }
        return 1 + (int) playerRepository.countByDropInIdAndRsvpStatusAndWaitlistedAtLessThan(
                player.getDropIn().getId(), RsvpStatus.WAITLISTED, player.getWaitlistedAt());
    }
}
