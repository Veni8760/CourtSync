package com.courtsync.dropins.rsvp.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.service.DropInService;
import com.courtsync.dropins.event.DropinEventPublisher;
import com.courtsync.dropins.event.DropinEvents;
import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.PaymentStatus;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;
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
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RsvpService {

    private final DropInService dropInService;
    private final DropInPlayerRepository playerRepository;
    private final DropinEventPublisher events;

    @Transactional
    public RsvpResponse rsvp(UUID dropInId, UUID userId) {
        DropIn dropIn = dropInService.lockForUpdate(dropInId);

        // Re-RSVP after a cancellation reuses the existing row (the UNIQUE
        // constraint forbids a second row for the same user + drop-in).
        DropInPlayer player = playerRepository.findByDropInIdAndUserId(dropInId, userId)
                .orElse(null);
        if (player != null && player.getRsvpStatus() == RsvpStatus.CONFIRMED) {
            throw new DuplicateRsvpException(dropInId, userId);
        }

        // The aggregate enforces capacity: throws DropInFullException if no room,
        // otherwise bumps confirmed_players and flips to FULL on the last spot.
        dropIn.reserveSpot();

        boolean paymentRequired = dropIn.getPrice().compareTo(BigDecimal.ZERO) > 0;

        if (player == null) {
            player = new DropInPlayer();
            player.setDropIn(dropIn);
            player.setUserId(userId);
        }
        player.setRsvpStatus(RsvpStatus.CONFIRMED);
        player.setPaymentStatus(paymentRequired ? PaymentStatus.PENDING : PaymentStatus.NOT_REQUIRED);
        DropInPlayer saved = playerRepository.save(player);

        log.info("RSVP confirmed: dropIn={} user={} ({}/{} spots filled)",
                dropInId, userId, dropIn.getConfirmedPlayers(), dropIn.getMaxPlayers());

        // NOTE (dual-write): publishing to Kafka inside the DB transaction is not
        // truly atomic — a crash between commit and send (or vice-versa) can drift
        // the two. The production fix is the transactional outbox pattern; the
        // skeleton accepts this and publishes here.
        events.publishRsvpCreated(DropinEvents.RsvpCreated.of(
                dropInId, userId, paymentRequired, dropIn.getPrice()));

        return RsvpResponse.from(saved);
    }

    @Transactional
    public void cancelRsvp(UUID dropInId, UUID userId) {
        DropIn dropIn = dropInService.lockForUpdate(dropInId);

        DropInPlayer player = playerRepository.findByDropInIdAndUserId(dropInId, userId)
                .filter(p -> p.getRsvpStatus() == RsvpStatus.CONFIRMED)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No active RSVP for user " + userId));

        player.setRsvpStatus(RsvpStatus.CANCELLED);
        playerRepository.save(player);

        // Free the spot on the aggregate; reopens a previously FULL drop-in.
        dropIn.releaseSpot();

        log.info("RSVP cancelled: dropIn={} user={} ({}/{} spots filled)",
                dropInId, userId, dropIn.getConfirmedPlayers(), dropIn.getMaxPlayers());

        events.publishRsvpCancelled(DropinEvents.RsvpCancelled.of(dropInId, userId));
    }
}
