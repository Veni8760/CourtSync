package com.courtsync.dropins.dropin.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.dropins.common.JwtPrincipal;
import com.courtsync.dropins.dropin.dto.CreateDropInRequest;
import com.courtsync.dropins.dropin.dto.DropInResponse;
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

    @GetMapping("/{id}")
    public DropInResponse get(@PathVariable UUID id) {
        return service.findById(id);
    }
}
