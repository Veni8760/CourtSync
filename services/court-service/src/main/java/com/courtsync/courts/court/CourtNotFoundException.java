package com.courtsync.courts.court;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when GET /courts/{id} finds nothing. @ResponseStatus tells Spring to
 * translate this exception into an HTTP 404 automatically — no try/catch in the
 * controller needed.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class CourtNotFoundException extends RuntimeException {
    public CourtNotFoundException(UUID id) {
        super("Court not found: " + id);
    }
}
