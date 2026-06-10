package com.courtsync.dropins.rsvp.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/**
 * Incoming body for POST /drop-ins/{id}/rsvp. The drop-in id comes from the URL
 * path; the body carries WHO is RSVPing. (Once auth exists, userId will come from
 * the authenticated principal instead of the request body.)
 */
public record CreateRsvpRequest(
        @NotNull(message = "userId is required") UUID userId) {
}
