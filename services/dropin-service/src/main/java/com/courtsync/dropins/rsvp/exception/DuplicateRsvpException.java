package com.courtsync.dropins.rsvp.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a user RSVPs twice to the same drop-in → HTTP 409 Conflict
 * (MASTER §17 DUPLICATE_RSVP). Lives in the rsvp package because it's the RSVP
 * operation's rule. The DB's UNIQUE(drop_in_id, user_id) is the ultimate guard;
 * this gives a clean error before we hit it in the common case.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateRsvpException extends RuntimeException {
    public DuplicateRsvpException(UUID dropInId, UUID userId) {
        super("User " + userId + " has already RSVP'd to drop-in " + dropInId);
    }
}
