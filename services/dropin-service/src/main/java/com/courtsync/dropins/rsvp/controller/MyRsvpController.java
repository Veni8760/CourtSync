package com.courtsync.dropins.rsvp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.dropins.common.JwtPrincipal;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.rsvp.service.RsvpService;

import lombok.RequiredArgsConstructor;

/**
 * The authenticated user's own RSVPs, not scoped to one drop-in:
 *   GET /drop-ins/rsvps/me   drop-ins this user has a CONFIRMED RSVP for
 * Separate from RsvpController because that one is bound to
 * /drop-ins/{dropInId}/rsvp. WHO comes from the JWT (sub), never the path.
 */
@RestController
@RequestMapping("/drop-ins/rsvps")
@RequiredArgsConstructor
public class MyRsvpController {

    private final RsvpService service;

    @GetMapping("/me")
    public List<DropInResponse> myRsvps(@AuthenticationPrincipal Jwt jwt) {
        return service.myRsvps(JwtPrincipal.userId(jwt));
    }
}
