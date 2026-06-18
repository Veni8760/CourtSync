package com.courtsync.search.dropin.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.search.dropin.dto.DropInSearchResult;
import com.courtsync.search.dropin.service.DropInSearchService;

import lombok.RequiredArgsConstructor;

/**
 * Read-only search API. Reached from the browser as {@code /api/search/drop-ins}
 * (the gateway strips {@code /api}). HTTP plumbing only — logic is in the service.
 */
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final DropInSearchService service;

    @GetMapping("/drop-ins")
    public List<DropInSearchResult> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm) {
        return service.findNearby(lat, lng, radiusKm);
    }
}
