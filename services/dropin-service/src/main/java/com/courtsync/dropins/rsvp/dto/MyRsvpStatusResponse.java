package com.courtsync.dropins.rsvp.dto;

import com.courtsync.dropins.rsvp.domain.RsvpStatus;

/**
 * Where the authenticated user stands on a given drop-in, so the detail page can
 * render exactly one correct action instead of guessing.
 *
 * {@code hasRsvp} stays for the "do I hold a confirmed spot" question the UI asked
 * before waitlists existed. {@code rsvpStatus} is null when the user has no active
 * row, and {@code waitlistPosition} is 1-based, 0 unless WAITLISTED.
 */
public record MyRsvpStatusResponse(
        boolean hasRsvp,
        RsvpStatus rsvpStatus,
        int waitlistPosition) {

    /** The user has never RSVP'd, or has cancelled. */
    public static MyRsvpStatusResponse none() {
        return new MyRsvpStatusResponse(false, null, 0);
    }
}
