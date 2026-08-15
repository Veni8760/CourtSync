package com.courtsync.notifications.alert.consumer;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * The union of every {@code dropin-events} payload, as far as alerting cares
 * about it (the wire contract is shared/event-contracts/events.md).
 *
 * One record rather than one per event type, because the alert consumer needs the
 * same three or four fields from all of them and would otherwise need a
 * polymorphic decode just to read {@code eventType}. Fields absent from a given
 * event decode as null — {@code position} only arrives on RSVP_WAITLISTED,
 * {@code userId} is absent on DROP_IN_CREATED / DROP_IN_CANCELLED.
 *
 * @JsonIgnoreProperties keeps this consumer from breaking when a producer adds a
 * field: unknown properties are dropped instead of throwing.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DropInEvent(
        String eventType,
        UUID dropInId,
        UUID userId,
        UUID organizerUserId,
        Integer position,
        Instant timestamp) {

    /**
     * Identifies one publish, for the idempotency check. eventType plus the
     * producer's timestamp is enough: the producer stamps Instant.now() per event,
     * so a redelivery of the SAME message repeats it exactly, while a genuinely
     * new event of the same type carries a later one.
     */
    public String eventKey() {
        return eventType + "@" + timestamp;
    }
}
