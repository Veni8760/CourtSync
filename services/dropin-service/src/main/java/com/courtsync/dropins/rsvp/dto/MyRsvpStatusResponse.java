package com.courtsync.dropins.rsvp.dto;

/**
 * Whether the authenticated user currently holds a CONFIRMED RSVP for a given
 * drop-in. Lets the detail page render one correct action (RSVP vs Cancel)
 * instead of guessing. Minimal on purpose — add rsvp/payment status here if a
 * UI needs them.
 */
public record MyRsvpStatusResponse(boolean hasRsvp) {
}
