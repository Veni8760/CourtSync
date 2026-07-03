package com.courtsync.dropins.rsvp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.dropin.service.DropInService;
import com.courtsync.dropins.event.DropinEventPublisher;
import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;
import com.courtsync.dropins.rsvp.repository.DropInPlayerRepository;

/**
 * The read-side of RSVP: "have I RSVP'd to X" and "what have I RSVP'd to".
 * Pure Mockito — the DB queries are trusted; this pins the CONFIRMED-only
 * filtering and the row→DropInResponse mapping.
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

    private DropInPlayer playerWith(RsvpStatus status, DropIn dropIn) {
        DropInPlayer p = new DropInPlayer();
        p.setDropIn(dropIn);
        p.setRsvpStatus(status);
        return p;
    }

    @Test
    void myStatus_confirmedRow_isTrue() {
        UUID dropInId = UUID.randomUUID(), userId = UUID.randomUUID();
        when(playerRepository.findByDropInIdAndUserId(dropInId, userId))
                .thenReturn(Optional.of(playerWith(RsvpStatus.CONFIRMED, new DropIn())));

        assertThat(service.myStatus(dropInId, userId).hasRsvp()).isTrue();
    }

    @Test
    void myStatus_cancelledRow_isFalse() {
        UUID dropInId = UUID.randomUUID(), userId = UUID.randomUUID();
        when(playerRepository.findByDropInIdAndUserId(dropInId, userId))
                .thenReturn(Optional.of(playerWith(RsvpStatus.CANCELLED, new DropIn())));

        assertThat(service.myStatus(dropInId, userId).hasRsvp()).isFalse();
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
        DropIn a = new DropIn();
        a.setId(UUID.randomUUID());
        DropIn b = new DropIn();
        b.setId(UUID.randomUUID());
        when(playerRepository.findWithDropInByUserIdAndRsvpStatus(userId, RsvpStatus.CONFIRMED))
                .thenReturn(List.of(playerWith(RsvpStatus.CONFIRMED, a),
                        playerWith(RsvpStatus.CONFIRMED, b)));

        assertThat(service.myRsvps(userId))
                .extracting(DropInResponse::id)
                .containsExactly(a.getId(), b.getId());
    }
}
