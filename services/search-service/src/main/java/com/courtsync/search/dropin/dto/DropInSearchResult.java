package com.courtsync.search.dropin.dto;

import java.io.Serializable;
import java.time.Instant;

/**
 * One nearby drop-in on the wire. A DTO (not the ES document) so the search API
 * stays decoupled from the index shape. {@code distanceKm} is computed from the
 * query point, so the caller can show "2.3 km away".
 *
 * Serializable so the Redis cache can JDK-serialize cached result lists.
 * ponytail: JDK serialization is fine for an internal cache; switch to JSON only
 * if something outside the JVM needs to read these cache entries.
 */
public record DropInSearchResult(
        String id,
        String title,
        String courtId,
        String city,
        double latitude,
        double longitude,
        double distanceKm,
        Double price,
        String skillLevel,
        Instant startTime) implements Serializable {
}
