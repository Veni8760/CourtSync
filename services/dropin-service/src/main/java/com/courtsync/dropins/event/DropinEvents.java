package com.courtsync.dropins.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Event payloads published to the {@code dropin-events} topic. These records ARE
 * the wire contract (shared/event-contracts/events.md) — Jackson serializes each
 * component name → JSON field, so the field names here must match exactly, since
 * the Go notification-service decodes this JSON.
 *
 * Lives in a top-level event/ package (not inside dropin/ or rsvp/) because both
 * features publish through it — it's a shared leaf that depends on nothing.
 */
public final class DropinEvents {

    private DropinEvents() {
    }

    /**
     * Published after a drop-in is created. Carries the denormalized court
     * location (lat/lng/city) so the search index can place it "nearby", plus the
     * card fields (title/price/skillLevel) so a search result is self-sufficient —
     * the read model never calls back to dropin-service. Location nullable when the
     * court has no coordinates.
     */
    public record DropInCreated(
            String eventType,
            UUID dropInId,
            UUID courtId,
            UUID organizerUserId,
            String title,
            Instant startTime,
            BigDecimal price,
            String skillLevel,
            Double latitude,
            Double longitude,
            String city,
            Instant timestamp) {

        public static DropInCreated of(UUID dropInId, UUID courtId, UUID organizerUserId, String title,
                Instant startTime, BigDecimal price, String skillLevel,
                Double latitude, Double longitude, String city) {
            return new DropInCreated("DROP_IN_CREATED", dropInId, courtId, organizerUserId, title,
                    startTime, price, skillLevel, latitude, longitude, city, Instant.now());
        }
    }

    /** Published after a successful RSVP. The load-bearing skeleton event. */
    public record RsvpCreated(
            String eventType,
            UUID dropInId,
            UUID userId,
            boolean paymentRequired,
            BigDecimal amount,
            Instant timestamp) {

        public static RsvpCreated of(UUID dropInId, UUID userId, boolean paymentRequired, BigDecimal amount) {
            return new RsvpCreated("RSVP_CREATED", dropInId, userId, paymentRequired, amount, Instant.now());
        }
    }

    /** Published after an RSVP is cancelled. */
    public record RsvpCancelled(
            String eventType,
            UUID dropInId,
            UUID userId,
            Instant timestamp) {

        public static RsvpCancelled of(UUID dropInId, UUID userId) {
            return new RsvpCancelled("RSVP_CANCELLED", dropInId, userId, Instant.now());
        }
    }
}
