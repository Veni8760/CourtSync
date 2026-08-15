package com.courtsync.notifications.common;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

/**
 * Reads the authenticated user's id from the validated Supabase JWT. Supabase
 * sets {@code sub} to the user's UUID, so that is our identity — never trust a
 * userId from the request. This is what scopes the alert feed: a user can only
 * ever read the alerts addressed to their own sub.
 */
public final class JwtPrincipal {

    private JwtPrincipal() {
    }

    public static UUID userId(Jwt jwt) {
        String sub = jwt.getSubject();
        if (sub == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing sub claim");
        }
        try {
            return UUID.fromString(sub);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "sub claim is not a UUID");
        }
    }
}
