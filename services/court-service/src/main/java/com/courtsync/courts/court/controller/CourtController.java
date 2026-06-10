package com.courtsync.courts.court.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.courts.court.dto.CourtResponse;
import com.courtsync.courts.court.dto.CreateCourtRequest;
import com.courtsync.courts.court.service.CourtService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST API for courts (MASTER §8.3):
 *   POST /courts       create
 *   GET  /courts       list all
 *   GET  /courts/{id}  one by id
 * The controller only does HTTP plumbing; all logic is delegated to CourtService.
 */
@RestController
@RequestMapping("/courts")
@RequiredArgsConstructor
public class CourtController {

    private final CourtService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourtResponse create(@Valid @RequestBody CreateCourtRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<CourtResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CourtResponse get(@PathVariable UUID id) {
        return service.findById(id);
    }
}
