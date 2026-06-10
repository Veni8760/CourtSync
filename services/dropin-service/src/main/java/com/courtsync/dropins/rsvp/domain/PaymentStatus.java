package com.courtsync.dropins.rsvp.domain;

/**
 * Payment state of an RSVP (MASTER §8.4). The skeleton has free drop-ins, so
 * every RSVP is NOT_REQUIRED for now; the rest exist so the Stripe work later
 * needs no schema change.
 */
public enum PaymentStatus {
    NOT_REQUIRED,
    PENDING,
    PAID,
    FAILED,
    REFUNDED
}
