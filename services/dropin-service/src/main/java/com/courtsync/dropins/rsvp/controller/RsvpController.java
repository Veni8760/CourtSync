package com.courtsync.dropins.rsvp.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.dropins.rsvp.dto.CreateRsvpRequest;
import com.courtsync.dropins.rsvp.dto.RsvpResponse;
import com.courtsync.dropins.rsvp.service.RsvpService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST API for RSVPs, nested under a drop-in (MASTER §8.4):
 *   POST   /drop-ins/{dropInId}/rsvp           RSVP a user
 *   DELETE /drop-ins/{dropInId}/rsvp/{userId}  cancel a user's RSVP
 * Separate from DropInController so each feature owns its own HTTP surface,
 * even though both sit under the /drop-ins path.
 */
@RestController
@RequestMapping("/drop-ins/{dropInId}/rsvp")
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RsvpResponse rsvp(@PathVariable UUID dropInId, @Valid @RequestBody CreateRsvpRequest request) {
        return service.rsvp(dropInId, request.userId());
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable UUID dropInId, @PathVariable UUID userId) {
        service.cancelRsvp(dropInId, userId);
    }
}
