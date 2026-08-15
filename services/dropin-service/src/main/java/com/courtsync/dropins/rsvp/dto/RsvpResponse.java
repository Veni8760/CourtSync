package com.courtsync.dropins.rsvp.dto;

import java.time.Instant;
import java.util.UUID;

import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.PaymentStatus;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;

/**
 * Outgoing JSON for a single RSVP (a drop_in_players row).
 *
 * {@code waitlistPosition} is 1-based and only meaningful when rsvpStatus is
 * WAITLISTED; it is 0 otherwise. It is derived at read time rather than stored,
 * so the caller is passed it in rather than it being read off the entity.
 */
public record RsvpResponse(
        UUID id,
        UUID dropInId,
        UUID userId,
        RsvpStatus rsvpStatus,
        PaymentStatus paymentStatus,
        int waitlistPosition,
        Instant createdAt) {

    public static RsvpResponse from(DropInPlayer p, int waitlistPosition) {
        return new RsvpResponse(
                p.getId(),
                p.getDropIn().getId(),
                p.getUserId(),
                p.getRsvpStatus(),
                p.getPaymentStatus(),
                waitlistPosition,
                p.getCreatedAt());
    }
}
