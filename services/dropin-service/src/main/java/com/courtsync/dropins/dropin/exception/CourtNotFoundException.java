package com.courtsync.dropins.dropin.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a drop-in is created referencing a court that court-service doesn't
 * know about. This is a CLIENT mistake — the request named a bad courtId — so it's
 * a 400, not a 404 (the drop-in URL itself is fine; its payload isn't).
 *
 * Note this lives in dropin-service and is distinct from court-service's own
 * CourtNotFoundException (404): same name, different bounded context, different meaning.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CourtNotFoundException extends RuntimeException {
    public CourtNotFoundException(UUID courtId) {
        super("Court does not exist: " + courtId);
    }
}
