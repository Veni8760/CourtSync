package com.courtsync.dropins.dropin.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Thrown when a drop-in id doesn't exist → HTTP 404 (MASTER §17 DROP_IN_NOT_FOUND). */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class DropInNotFoundException extends RuntimeException {
    public DropInNotFoundException(UUID id) {
        super("Drop-in not found: " + id);
    }
}
