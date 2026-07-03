package com.courtsync.dropins.dropin.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.dropins.common.JwtPrincipal;
import com.courtsync.dropins.dropin.dto.CreateDropInRequest;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.dropin.dto.UpdateDropInRequest;
import com.courtsync.dropins.dropin.service.DropInService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST API for the drop-in resource (MASTER §8.4):
 *   POST /drop-ins       create
 *   GET  /drop-ins       list all
 *   GET  /drop-ins/{id}  one by id
 * RSVP endpoints live in the rsvp package's RsvpController, not here.
 * Thin controller: HTTP in/out only, all logic delegated to DropInService.
 */
@RestController
@RequestMapping("/drop-ins")
@RequiredArgsConstructor
public class DropInController {

    private final DropInService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DropInResponse create(@Valid @RequestBody CreateDropInRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return service.create(request, JwtPrincipal.userId(jwt));
    }

    @GetMapping
    public List<DropInResponse> list() {
        return service.findAll();
    }

    // Literal path — Spring resolves it ahead of the /{id} pattern below, so
    // "hosted" is never parsed as a drop-in id.
    @GetMapping("/hosted")
    public List<DropInResponse> hosted(@AuthenticationPrincipal Jwt jwt) {
        return service.findByOrganizer(JwtPrincipal.userId(jwt));
    }

    @GetMapping("/{id}")
    public DropInResponse get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public DropInResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateDropInRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return service.update(id, request, JwtPrincipal.userId(jwt));
    }

    @PatchMapping("/{id}/cancel")
    public DropInResponse cancel(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return service.cancel(id, JwtPrincipal.userId(jwt));
    }
}
