package com.courtsync.dropins.rsvp.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.dropins.common.JwtPrincipal;
import com.courtsync.dropins.rsvp.dto.MyRsvpStatusResponse;
import com.courtsync.dropins.rsvp.dto.RsvpResponse;
import com.courtsync.dropins.rsvp.service.RsvpService;

import lombok.RequiredArgsConstructor;

/**
 * REST API for RSVPs, nested under a drop-in (MASTER §8.4):
 *   POST   /drop-ins/{dropInId}/rsvp      RSVP the authenticated user
 *   DELETE /drop-ins/{dropInId}/rsvp      cancel the authenticated user's RSVP
 *   GET    /drop-ins/{dropInId}/rsvp/me   is the authenticated user RSVP'd?
 * WHO is RSVPing comes from the validated JWT (sub), not the request — so there
 * is no body and no userId in the path.
 */
@RestController
@RequestMapping("/drop-ins/{dropInId}/rsvp")
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RsvpResponse rsvp(@PathVariable UUID dropInId, @AuthenticationPrincipal Jwt jwt) {
        return service.rsvp(dropInId, JwtPrincipal.userId(jwt));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable UUID dropInId, @AuthenticationPrincipal Jwt jwt) {
        service.cancelRsvp(dropInId, JwtPrincipal.userId(jwt));
    }

    @GetMapping("/me")
    public MyRsvpStatusResponse myStatus(@PathVariable UUID dropInId, @AuthenticationPrincipal Jwt jwt) {
        return service.myStatus(dropInId, JwtPrincipal.userId(jwt));
    }
}
