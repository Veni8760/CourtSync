package com.courtsync.search.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Consumes {@code dropin-events} and (for the skeleton) just logs them. Later
 * this is where the search-service will index drop-ins into Elasticsearch.
 *
 * This is the second consumer of the same topic, alongside the Go
 * notification-service — that's the whole point of Kafka: dropin-service publishes
 * once, and any number of independent services react without it knowing they exist.
 *
 * We parse to a JsonNode and switch on {@code eventType} so a single listener
 * handles every shape on the topic (RSVP_CREATED, RSVP_CANCELLED, DROP_IN_CREATED)
 * without a strongly-typed class per event.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DropinEventConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${courtsync.kafka.dropin-topic:dropin-events}",
            groupId = "${spring.kafka.consumer.group-id:search-service}")
    public void onDropinEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.path("eventType").asText("UNKNOWN");

            switch (eventType) {
                case "RSVP_CREATED" -> log.info(
                        "RSVP_CREATED consumed: dropIn={} user={} (would index/refresh search)",
                        event.path("dropInId").asText(), event.path("userId").asText());
                case "RSVP_CANCELLED" -> log.info(
                        "RSVP_CANCELLED consumed: dropIn={} user={}",
                        event.path("dropInId").asText(), event.path("userId").asText());
                case "DROP_IN_CREATED" -> log.info(
                        "DROP_IN_CREATED consumed: dropIn={} court={} (would index new drop-in)",
                        event.path("dropInId").asText(), event.path("courtId").asText());
                default -> log.warn("Ignoring unknown dropin event type='{}' raw={}", eventType, message);
            }
        } catch (Exception e) {
            // Don't let one malformed message kill the listener; log and move on.
            log.error("Failed to process dropin event: {}", message, e);
        }
    }
}
