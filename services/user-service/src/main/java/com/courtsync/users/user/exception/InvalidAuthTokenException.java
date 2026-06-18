package com.courtsync.users.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAuthTokenException extends RuntimeException {

    public InvalidAuthTokenException(String detail) {
        super("Invalid auth token: " + detail);
    }
}
