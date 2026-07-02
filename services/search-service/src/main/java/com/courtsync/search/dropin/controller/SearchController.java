package com.courtsync.search.dropin.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.search.dropin.dto.DropInSearchResult;
import com.courtsync.search.dropin.dto.NearbyFilters;
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

    // Optional filters narrow the radius results; omitting a param means "don't
    // filter on it". q is a free-text keyword matched against the drop-in title
    // (full-text, tokenized); skill/maxPrice/from/to (ISO-8601 instants) filter the rest.
    @GetMapping("/drop-ins")
    public List<DropInSearchResult> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        return service.findNearby(lat, lng, radiusKm, new NearbyFilters(q, skill, maxPrice, from, to));
    }
}
