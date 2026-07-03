package com.courtsync.dropins.dropin.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Thrown when a non-organizer tries to modify a drop-in → HTTP 403 (MASTER §17). */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class NotDropInOwnerException extends RuntimeException {
    public NotDropInOwnerException(UUID id) {
        super("You do not own drop-in: " + id);
    }
}
