package com.courtsync.notifications.alert.consumer;

import java.util.UUID;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.courtsync.notifications.alert.domain.AlertType;
import com.courtsync.notifications.alert.service.AlertService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

/**
 * Consumes {@code dropin-events} and turns each one into alerts. This is the
 * whole reason the service exists: dropin-service publishes "this happened" and
 * never knows or cares that anybody is notified.
 *
 * Runs in its own consumer group (notification-service), so it and search-service
 * each see every message on the topic.
 *
 * Delivery is at-least-once, so this handler must be idempotent — that's what
 * AlertService.record()'s event-key check provides. A message we can't parse is
 * logged and skipped rather than retried forever, which would wedge the partition.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DropInEventConsumer {

    private final AlertService alerts;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${courtsync.kafka.dropin-topic:dropin-events}",
            groupId = "${spring.kafka.consumer.group-id:notification-service}")
    public void onDropinEvent(String message) {
        DropInEvent event;
        try {
            event = objectMapper.readValue(message, DropInEvent.class);
        } catch (JacksonException e) {
            log.warn("Skipping unparseable dropin event", e);
            return;
        }

        if (event.eventType() == null || event.dropInId() == null) {
            log.warn("Skipping dropin event with no eventType/dropInId");
            return;
        }

        switch (event.eventType()) {
            case "RSVP_CREATED" -> raise(event, event.userId(), AlertType.RSVP_CONFIRMED,
                    "You're in — your spot is confirmed.");

            case "RSVP_WAITLISTED" -> raise(event, event.userId(), AlertType.WAITLISTED,
                    "This drop-in is full. You're #" + event.position()
                            + " on the waitlist and we'll tell you if a spot opens.");

            case "RSVP_PROMOTED" -> raise(event, event.userId(), AlertType.PROMOTED,
                    "A spot opened up and it's yours — you're off the waitlist and confirmed.");

            case "DROP_IN_CANCELLED" -> fanOutCancellation(event);

            // DROP_IN_CREATED and RSVP_CANCELLED are the player's own doing or not
            // about them; nothing to tell anyone.
            default -> log.debug("No alert for {} event", event.eventType());
        }
    }

    /**
     * The organizer called the session off, so everyone who was told anything
     * about it needs to hear that. The event carries no player list (dropin-service
     * would have to break its own feature-package boundary to build one), so the
     * recipients come from the alerts this service has already written.
     */
    private void fanOutCancellation(DropInEvent event) {
        int notified = 0;
        for (UUID userId : alerts.recipientsFor(event.dropInId())) {
            if (userId.equals(event.organizerUserId())) {
                continue; // they're the one who cancelled it
            }
            if (alerts.record(userId, event.dropInId(), AlertType.DROP_IN_CANCELLED,
                    "This drop-in was cancelled by the organizer.", event.eventKey())) {
                notified++;
            }
        }
        log.info("Drop-in {} cancelled: notified {} player(s)", event.dropInId(), notified);
    }

    private void raise(DropInEvent event, UUID userId, AlertType type, String message) {
        if (userId == null) {
            log.warn("{} event for drop-in {} carried no userId — skipping",
                    event.eventType(), event.dropInId());
            return;
        }
        if (!alerts.record(userId, event.dropInId(), type, message, event.eventKey())) {
            log.debug("Redelivered {} for user {} — alert already exists", event.eventType(), userId);
        }
    }
}
