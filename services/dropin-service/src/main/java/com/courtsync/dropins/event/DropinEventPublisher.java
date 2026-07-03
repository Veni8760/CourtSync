package com.courtsync.dropins.event;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Publishes domain events to the {@code dropin-events} Kafka topic.
 *
 * Why a thin wrapper around KafkaTemplate:
 *   - One place owns serialization + the topic name (DRY).
 *   - The service layer depends on "publish this event", not on Kafka details.
 *
 * Key design: we use {@code dropInId} as the Kafka message KEY. Kafka keeps
 * order within a partition and routes equal keys to the same partition, so all
 * events for one drop-in stay correctly ordered (RSVP_CREATED before its
 * RSVP_CANCELLED).
 *
 * Injection note: @RequiredArgsConstructor wires the two final BEANS; the topic
 * is a config value, so it uses @Value field injection rather than the constructor.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DropinEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${courtsync.kafka.dropin-topic:dropin-events}")
    private String topic;

    public void publishDropInCreated(DropinEvents.DropInCreated event) {
        publish(event.eventType(), event.dropInId(), event);
    }

    public void publishRsvpCreated(DropinEvents.RsvpCreated event) {
        publish(event.eventType(), event.dropInId(), event);
    }

    public void publishRsvpCancelled(DropinEvents.RsvpCancelled event) {
        publish(event.eventType(), event.dropInId(), event);
    }

    public void publishDropInCancelled(DropinEvents.DropInCancelled event) {
        publish(event.eventType(), event.dropInId(), event);
    }

    /** Serialize the payload to JSON and send it keyed by drop-in id. */
    private void publish(String eventType, UUID key, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(topic, key.toString(), json);
            log.debug("Published {} to {} key={}", eventType, topic, key);
        } catch (JacksonException e) {
            // Serializing our own record should never fail; if it does it's a
            // programming error, so fail loudly rather than swallow it. (Jackson 3
            // exceptions are unchecked, but we still catch to add context.)
            throw new IllegalStateException("Failed to serialize dropin event: " + payload, e);
        }
    }
}
