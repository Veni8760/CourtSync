package com.courtsync.dropins.dropin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.dto.CreateDropInRequest;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.dropin.exception.CourtNotFoundException;
import com.courtsync.dropins.dropin.grpc.CourtClient;
import com.courtsync.dropins.dropin.grpc.CourtClient.CourtView;
import com.courtsync.dropins.dropin.repository.DropInRepository;
import com.courtsync.dropins.event.DropinEventPublisher;
import com.courtsync.dropins.event.DropinEvents;

/**
 * Unit-tests the one piece of real logic in create(): it denormalizes the court's
 * location from the gRPC lookup onto both the row and the published event, and
 * rejects an unknown court. Pure Mockito — no Spring context, no Kafka, no DB.
 */
@ExtendWith(MockitoExtension.class)
class DropInServiceTest {

    @Mock
    private DropInRepository repository;
    @Mock
    private DropinEventPublisher events;
    @Mock
    private CourtClient courtClient;
    @InjectMocks
    private DropInService service;

    private CreateDropInRequest request(UUID courtId) {
        return new CreateDropInRequest(
                courtId, "Pickup", null,
                Instant.parse("2026-07-01T18:00:00Z"),
                Instant.parse("2026-07-01T20:00:00Z"),
                12, BigDecimal.ZERO, "Open");
    }

    @Test
    void create_stampsCourtLocationOntoThePublishedEvent() {
        UUID courtId = UUID.randomUUID();
        when(courtClient.getCourt(courtId))
                .thenReturn(Optional.of(new CourtView(43.65, -79.38, "Toronto")));
        when(repository.save(any(DropIn.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(request(courtId), UUID.randomUUID());

        ArgumentCaptor<DropinEvents.DropInCreated> captor =
                ArgumentCaptor.forClass(DropinEvents.DropInCreated.class);
        verify(events).publishDropInCreated(captor.capture());
        DropinEvents.DropInCreated event = captor.getValue();
        assertThat(event.latitude()).isEqualTo(43.65);
        assertThat(event.longitude()).isEqualTo(-79.38);
        assertThat(event.city()).isEqualTo("Toronto");
    }

    @Test
    void create_unknownCourt_throwsAndPublishesNothing() {
        UUID courtId = UUID.randomUUID();
        when(courtClient.getCourt(courtId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request(courtId), UUID.randomUUID()))
                .isInstanceOf(CourtNotFoundException.class);
    }

    @Test
    void findByOrganizer_mapsThatOrganizersDropIns() {
        UUID organizer = UUID.randomUUID();
        DropIn a = new DropIn();
        a.setId(UUID.randomUUID());
        DropIn b = new DropIn();
        b.setId(UUID.randomUUID());
        when(repository.findByOrganizerUserId(organizer)).thenReturn(List.of(a, b));

        assertThat(service.findByOrganizer(organizer))
                .extracting(DropInResponse::id)
                .containsExactly(a.getId(), b.getId());
    }
}
