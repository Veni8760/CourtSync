package com.courtsync.search.dropin.dto;

import java.time.Instant;

/**
 * One nearby drop-in on the wire. A DTO (not the ES document) so the search API
 * stays decoupled from the index shape. {@code distanceKm} is computed from the
 * query point, so the caller can show "2.3 km away".
 */
public record DropInSearchResult(
        String id,
        String courtId,
        String city,
        double latitude,
        double longitude,
        double distanceKm,
        Instant startTime) {
}
