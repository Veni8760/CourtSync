package com.courtsync.dropins.dropin.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an RSVP is attempted against a drop-in at capacity → HTTP 409
 * Conflict (MASTER §17 DROP_IN_FULL). Lives in the dropin package because
 * "is it full?" is the DROP-IN aggregate's invariant — it's raised by
 * DropIn.reserveSpot(). 409, not 400: the request was valid, the state forbids it.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DropInFullException extends RuntimeException {
    public DropInFullException(UUID id) {
        super("This drop-in is already full: " + id);
    }
}
