package com.courtsync.dropins.rsvp.domain;

/**
 * State of a single player's RSVP (a drop_in_players row).
 *   CONFIRMED  — has a confirmed spot.
 *   CANCELLED  — pulled out. We keep the row (audit trail) and flip its status
 *                rather than deleting, so history isn't lost and re-RSVP reuses it.
 *   WAITLISTED — reserved for the future waitlist feature.
 */
public enum RsvpStatus {
    CONFIRMED,
    CANCELLED,
    WAITLISTED
}
