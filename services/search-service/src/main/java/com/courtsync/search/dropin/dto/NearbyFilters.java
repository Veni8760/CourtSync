package com.courtsync.search.dropin.dto;

import java.time.Instant;

/**
 * Optional filters layered on top of the geo radius. Any field may be null
 * (meaning "don't filter on this"). A parameter object so the service signature
 * and the cache key stay readable as filters grow.
 */
public record NearbyFilters(String q, String skill, Double maxPrice, Instant from, Instant to) {

    public static final NearbyFilters NONE = new NearbyFilters(null, null, null, null, null);

    /** True when a non-blank keyword query was supplied (drives the ES match query). */
    public boolean hasKeyword() {
        return q != null && !q.isBlank();
    }
}
