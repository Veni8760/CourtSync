package com.courtsync.notifications.alert.consumer;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.courtsync.notifications.alert.domain.AlertType;
import com.courtsync.notifications.alert.service.AlertService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * The event → alert mapping. Uses a real ObjectMapper so the JSON shapes in
 * shared/event-contracts/events.md are actually exercised — a renamed field in
 * the contract should fail here, not in production.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DropInEventConsumerTest {

    @Mock
    private AlertService alerts;

    private final ObjectMapper objectMapper = JsonMapper.builder().findAndAddModules().build();

    private DropInEventConsumer consumer() {
        return new DropInEventConsumer(alerts, objectMapper);
    }

    @Test
    void rsvpCreated_confirmsTheSpotToThatPlayer() {
        UUID dropInId = UUID.randomUUID(), userId = UUID.randomUUID();

        consumer().onDropinEvent("""
                {"eventType":"RSVP_CREATED","dropInId":"%s","userId":"%s",
                 "paymentRequired":false,"amount":0,"timestamp":"2026-08-14T12:00:00Z"}
                """.formatted(dropInId, userId));

        verify(alerts).record(eq(userId), eq(dropInId), eq(AlertType.RSVP_CONFIRMED),
                anyString(), eq("RSVP_CREATED@2026-08-14T12:00:00Z"));
    }

    @Test
    void rsvpWaitlisted_tellsThePlayerTheirPosition() {
        UUID dropInId = UUID.randomUUID(), userId = UUID.randomUUID();

        consumer().onDropinEvent("""
                {"eventType":"RSVP_WAITLISTED","dropInId":"%s","userId":"%s",
                 "position":3,"timestamp":"2026-08-14T12:00:00Z"}
                """.formatted(dropInId, userId));

        verify(alerts).record(eq(userId), eq(dropInId), eq(AlertType.WAITLISTED),
                contains("#3"), anyString());
    }

    @Test
    void rsvpPromoted_raisesThePromotionAlert() {
        UUID dropInId = UUID.randomUUID(), userId = UUID.randomUUID();

        consumer().onDropinEvent("""
                {"eventType":"RSVP_PROMOTED","dropInId":"%s","userId":"%s",
                 "timestamp":"2026-08-14T12:00:00Z"}
                """.formatted(dropInId, userId));

        verify(alerts).record(eq(userId), eq(dropInId), eq(AlertType.PROMOTED),
                anyString(), anyString());
    }

    @Test
    void dropInCancelled_alertsEveryPlayerExceptTheOrganizer() {
        UUID dropInId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        UUID playerA = UUID.randomUUID(), playerB = UUID.randomUUID();
        when(alerts.recipientsFor(dropInId)).thenReturn(List.of(playerA, organizerId, playerB));

        consumer().onDropinEvent("""
                {"eventType":"DROP_IN_CANCELLED","dropInId":"%s","organizerUserId":"%s",
                 "timestamp":"2026-08-14T12:00:00Z"}
                """.formatted(dropInId, organizerId));

        verify(alerts).record(eq(playerA), eq(dropInId), eq(AlertType.DROP_IN_CANCELLED),
                anyString(), anyString());
        verify(alerts).record(eq(playerB), eq(dropInId), eq(AlertType.DROP_IN_CANCELLED),
                anyString(), anyString());
        verify(alerts, never()).record(eq(organizerId), any(), any(), anyString(), anyString());
    }

    @Test
    void rsvpCancelled_raisesNothing() {
        consumer().onDropinEvent("""
                {"eventType":"RSVP_CANCELLED","dropInId":"%s","userId":"%s",
                 "timestamp":"2026-08-14T12:00:00Z"}
                """.formatted(UUID.randomUUID(), UUID.randomUUID()));

        verifyNoInteractions(alerts);
    }

    @Test
    void dropInCreated_raisesNothing() {
        consumer().onDropinEvent("""
                {"eventType":"DROP_IN_CREATED","dropInId":"%s","courtId":"%s",
                 "organizerUserId":"%s","title":"Tuesday six-pack","surface":"INDOOR",
                 "timestamp":"2026-08-14T12:00:00Z"}
                """.formatted(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID()));

        verifyNoInteractions(alerts);
    }

    @Test
    void unparseableMessage_isSkippedNotRetriedForever() {
        consumer().onDropinEvent("not json at all");

        verifyNoInteractions(alerts);
    }

    @Test
    void eventWithoutEventType_isSkipped() {
        consumer().onDropinEvent("{\"dropInId\":\"%s\"}".formatted(UUID.randomUUID()));

        verifyNoInteractions(alerts);
    }
}
