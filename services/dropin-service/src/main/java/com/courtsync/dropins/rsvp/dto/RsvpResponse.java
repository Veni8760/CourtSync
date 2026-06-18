package com.courtsync.dropins.rsvp.dto;

import java.time.Instant;
import java.util.UUID;

import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.PaymentStatus;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;

/** Outgoing JSON for a single RSVP (a drop_in_players row). */
public record RsvpResponse(
        UUID id,
        UUID dropInId,
        UUID userId,
        RsvpStatus rsvpStatus,
        PaymentStatus paymentStatus,
        Instant createdAt) {

    public static RsvpResponse from(DropInPlayer p) {
        return new RsvpResponse(
                p.getId(),
                p.getDropIn().getId(),
                p.getUserId(),
                p.getRsvpStatus(),
                p.getPaymentStatus(),
                p.getCreatedAt());
    }
}
