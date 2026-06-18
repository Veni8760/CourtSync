package com.courtsync.search.dropin.consumer;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * The slice of the {@code DROP_IN_CREATED} payload (dropin-service's
 * DropinEvents.DropInCreated, per shared/event-contracts) that search needs to
 * index. {@code ignoreUnknown} so the contract can grow new fields without
 * breaking this consumer, and so RSVP events on the same topic decode without error
 * (we filter them out by {@code eventType}). UUIDs arrive as strings.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DropInCreatedEvent(
        String eventType,
        String dropInId,
        String courtId,
        String organizerUserId,
        String title,
        Instant startTime,
        Double price,
        String skillLevel,
        Double latitude,
        Double longitude,
        String city) {
}
