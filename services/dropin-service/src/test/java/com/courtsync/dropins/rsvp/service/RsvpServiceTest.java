package com.courtsync.dropins.rsvp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.domain.DropInStatus;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.dropin.service.DropInService;
import com.courtsync.dropins.event.DropinEventPublisher;
import com.courtsync.dropins.event.DropinEvents;
import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;
import com.courtsync.dropins.rsvp.repository.DropInPlayerRepository;

/**
 * RSVP + waitlist behaviour. Pure Mockito — the DB queries themselves are
 * trusted; what's pinned here is the branching the service owns: take a spot vs
 * join the queue, and give the freed spot to the longest-waiting player.
 */
@ExtendWith(MockitoExtension.class)
class RsvpServiceTest {

    @Mock
    private DropInService dropInService;
    @Mock
    private DropInPlayerRepository playerRepository;
    @Mock
    private DropinEventPublisher events;
    @InjectMocks
    private RsvpService service;

    private DropIn dropIn(int maxPlayers, int confirmed) {
        DropIn d = new DropIn();
        d.setId(UUID.randomUUID());
        d.setMaxPlayers(maxPlayers);
        d.setConfirmedPlayers(confirmed);
        d.setStatus(confirmed >= maxPlayers ? DropInStatus.FULL : DropInStatus.OPEN);
        return d;
    }

    private DropInPlayer playerWith(RsvpStatus status, DropIn dropIn) {
        DropInPlayer p = new DropInPlayer();
        p.setId(UUID.randomUUID());
        p.setDropIn(dropIn);
        p.setUserId(UUID.randomUUID());
        p.setRsvpStatus(status);
        if (status == RsvpStatus.WAITLISTED) {
            p.setWaitlistedAt(Instant.now());
        }
        return p;
    }

    /** Saving returns the same managed instance, which is what JPA does. */
    private void echoSaves() {
        when(playerRepository.save(any(DropInPlayer.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void rsvp_withRoom_takesASpot() {
        DropIn d = dropIn(6, 2);
        UUID userId = UUID.randomUUID();
        when(dropInService.lockForUpdate(d.getId())).thenReturn(d);
        when(playerRepository.findByDropInIdAndUserId(d.getId(), userId)).thenReturn(Optional.empty());
        echoSaves();

        var response = service.rsvp(d.getId(), userId);

        assertThat(response.rsvpStatus()).isEqualTo(RsvpStatus.CONFIRMED);
        assertThat(response.waitlistPosition()).isZero();
        assertThat(d.getConfirmedPlayers()).isEqualTo(3);
        verify(events).publishRsvpCreated(any());
        verify(events, never()).publishRsvpWaitlisted(any());
    }

    @Test
    void rsvp_whenFull_joinsTheWaitlistInsteadOfFailing() {
        DropIn d = dropIn(6, 6);
        UUID userId = UUID.randomUUID();
        when(dropInService.lockForUpdate(d.getId())).thenReturn(d);
        when(playerRepository.findByDropInIdAndUserId(d.getId(), userId)).thenReturn(Optional.empty());
        echoSaves();
        // Two players already waiting → the new one is third in line.
        when(playerRepository.countByDropInIdAndRsvpStatusAndWaitlistedAtLessThan(
                any(), any(), any())).thenReturn(2L);

        var response = service.rsvp(d.getId(), userId);

        assertThat(response.rsvpStatus()).isEqualTo(RsvpStatus.WAITLISTED);
        assertThat(response.waitlistPosition()).isEqualTo(3);
        // Waitlisting must not consume capacity.
        assertThat(d.getConfirmedPlayers()).isEqualTo(6);
        verify(events).publishRsvpWaitlisted(any(DropinEvents.RsvpWaitlisted.class));
        verify(events, never()).publishRsvpCreated(any());
    }

    @Test
    void cancel_promotesTheLongestWaitingPlayerIntoTheFreedSpot() {
        DropIn d = dropIn(6, 6);
        UUID leaverId = UUID.randomUUID();
        DropInPlayer leaver = playerWith(RsvpStatus.CONFIRMED, d);
        leaver.setUserId(leaverId);
        DropInPlayer next = playerWith(RsvpStatus.WAITLISTED, d);

        when(dropInService.lockForUpdate(d.getId())).thenReturn(d);
        when(playerRepository.findByDropInIdAndUserId(d.getId(), leaverId))
                .thenReturn(Optional.of(leaver));
        when(playerRepository.findFirstByDropInIdAndRsvpStatusOrderByWaitlistedAtAsc(
                d.getId(), RsvpStatus.WAITLISTED)).thenReturn(Optional.of(next));

        service.cancelRsvp(d.getId(), leaverId);

        assertThat(leaver.getRsvpStatus()).isEqualTo(RsvpStatus.CANCELLED);
        assertThat(next.getRsvpStatus()).isEqualTo(RsvpStatus.CONFIRMED);
        assertThat(next.getWaitlistedAt()).isNull();
        // Released once, re-reserved by the promotion → capacity is unchanged.
        assertThat(d.getConfirmedPlayers()).isEqualTo(6);
        verify(events).publishRsvpCancelled(any());
        verify(events).publishRsvpPromoted(any(DropinEvents.RsvpPromoted.class));
    }

    @Test
    void cancel_withEmptyWaitlist_justFreesTheSpot() {
        DropIn d = dropIn(6, 6);
        UUID leaverId = UUID.randomUUID();
        DropInPlayer leaver = playerWith(RsvpStatus.CONFIRMED, d);
        leaver.setUserId(leaverId);

        when(dropInService.lockForUpdate(d.getId())).thenReturn(d);
        when(playerRepository.findByDropInIdAndUserId(d.getId(), leaverId))
                .thenReturn(Optional.of(leaver));
        when(playerRepository.findFirstByDropInIdAndRsvpStatusOrderByWaitlistedAtAsc(
                d.getId(), RsvpStatus.WAITLISTED)).thenReturn(Optional.empty());

        service.cancelRsvp(d.getId(), leaverId);

        assertThat(d.getConfirmedPlayers()).isEqualTo(5);
        assertThat(d.getStatus()).isEqualTo(DropInStatus.OPEN);
        verify(events, never()).publishRsvpPromoted(any());
    }

    @Test
    void cancel_fromTheWaitlist_leavesCapacityAloneAndPromotesNobody() {
        DropIn d = dropIn(6, 6);
        UUID userId = UUID.randomUUID();
        DropInPlayer waiting = playerWith(RsvpStatus.WAITLISTED, d);
        waiting.setUserId(userId);

        when(dropInService.lockForUpdate(d.getId())).thenReturn(d);
        when(playerRepository.findByDropInIdAndUserId(d.getId(), userId))
                .thenReturn(Optional.of(waiting));

        service.cancelRsvp(d.getId(), userId);

        assertThat(waiting.getRsvpStatus()).isEqualTo(RsvpStatus.CANCELLED);
        assertThat(waiting.getWaitlistedAt()).isNull();
        assertThat(d.getConfirmedPlayers()).isEqualTo(6);
        verify(events).publishRsvpCancelled(any());
        verify(events, never()).publishRsvpPromoted(any());
    }

    @Test
    void myStatus_confirmedRow_isTrue() {
        DropIn d = dropIn(6, 1);
        UUID userId = UUID.randomUUID();
        when(playerRepository.findByDropInIdAndUserId(d.getId(), userId))
                .thenReturn(Optional.of(playerWith(RsvpStatus.CONFIRMED, d)));

        var status = service.myStatus(d.getId(), userId);

        assertThat(status.hasRsvp()).isTrue();
        assertThat(status.rsvpStatus()).isEqualTo(RsvpStatus.CONFIRMED);
        assertThat(status.waitlistPosition()).isZero();
    }

    @Test
    void myStatus_waitlistedRow_reportsPositionButNotAConfirmedSpot() {
        DropIn d = dropIn(6, 6);
        UUID userId = UUID.randomUUID();
        when(playerRepository.findByDropInIdAndUserId(d.getId(), userId))
                .thenReturn(Optional.of(playerWith(RsvpStatus.WAITLISTED, d)));
        when(playerRepository.countByDropInIdAndRsvpStatusAndWaitlistedAtLessThan(
                any(), any(), any())).thenReturn(1L);

        var status = service.myStatus(d.getId(), userId);

        assertThat(status.hasRsvp()).isFalse();
        assertThat(status.rsvpStatus()).isEqualTo(RsvpStatus.WAITLISTED);
        assertThat(status.waitlistPosition()).isEqualTo(2);
    }

    @Test
    void myStatus_cancelledRow_isFalse() {
        DropIn d = dropIn(6, 1);
        UUID userId = UUID.randomUUID();
        when(playerRepository.findByDropInIdAndUserId(d.getId(), userId))
                .thenReturn(Optional.of(playerWith(RsvpStatus.CANCELLED, d)));

        var status = service.myStatus(d.getId(), userId);

        assertThat(status.hasRsvp()).isFalse();
        assertThat(status.rsvpStatus()).isNull();
    }

    @Test
    void myStatus_noRow_isFalse() {
        UUID dropInId = UUID.randomUUID(), userId = UUID.randomUUID();
        when(playerRepository.findByDropInIdAndUserId(dropInId, userId))
                .thenReturn(Optional.empty());

        assertThat(service.myStatus(dropInId, userId).hasRsvp()).isFalse();
    }

    @Test
    void myRsvps_mapsConfirmedRowsToTheirDropIns() {
        UUID userId = UUID.randomUUID();
        DropIn a = dropIn(6, 1);
        DropIn b = dropIn(6, 1);
        when(playerRepository.findWithDropInByUserIdAndRsvpStatus(userId, RsvpStatus.CONFIRMED))
                .thenReturn(List.of(playerWith(RsvpStatus.CONFIRMED, a),
                        playerWith(RsvpStatus.CONFIRMED, b)));

        assertThat(service.myRsvps(userId))
                .extracting(DropInResponse::id)
                .containsExactly(a.getId(), b.getId());
    }

    @Test
    void myWaitlist_mapsWaitlistedRowsToTheirDropIns() {
        UUID userId = UUID.randomUUID();
        DropIn a = dropIn(6, 6);
        when(playerRepository.findWithDropInByUserIdAndRsvpStatus(userId, RsvpStatus.WAITLISTED))
                .thenReturn(List.of(playerWith(RsvpStatus.WAITLISTED, a)));

        assertThat(service.myWaitlist(userId))
                .extracting(DropInResponse::id)
                .containsExactly(a.getId());
    }
}
