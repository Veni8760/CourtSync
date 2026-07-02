package com.courtsync.search.dropin.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.stereotype.Service;

import com.courtsync.search.config.CacheConfig;
import com.courtsync.search.dropin.document.DropInDocument;
import com.courtsync.search.dropin.dto.DropInSearchResult;
import com.courtsync.search.dropin.dto.NearbyFilters;
import com.courtsync.search.dropin.repository.DropInSearchRepository;

import lombok.RequiredArgsConstructor;

/**
 * "Drop-ins near me." Elasticsearch does the radius FILTER (geo_distance, what it's
 * good at); we sort the resulting small set nearest-first in-app via haversine and
 * attach each distance for the UI.
 */
@Service
@RequiredArgsConstructor
public class DropInSearchService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private final DropInSearchRepository repository;

    // Cache by ~100m-rounded coordinates + radius + filter values so repeated "near me"
    // queries from the same spot with the same filters hit Redis instead of Elasticsearch
    // (the "sub-second" win). 60s TTL.
    @Cacheable(cacheNames = CacheConfig.NEARBY_CACHE,
            key = "T(java.lang.Math).round(#lat*1000) + ':' + T(java.lang.Math).round(#lng*1000) + ':' + #radiusKm"
                    + " + ':' + #filters.q() + ':' + #filters.skill() + ':' + #filters.maxPrice()"
                    + " + ':' + #filters.from() + ':' + #filters.to()")
    public List<DropInSearchResult> findNearby(double lat, double lng, double radiusKm, NearbyFilters filters) {
        GeoPoint center = new GeoPoint(lat, lng);
        Distance radius = new Distance(radiusKm, Metrics.KILOMETERS);

        // ES does the radius filter (plus a full-text title match when a keyword is
        // given); the remaining filters are applied in-app on that already-small
        // geo-bounded set. ponytail: push these into an ES bool query if result sets grow.
        List<DropInDocument> hits = filters.hasKeyword()
                ? repository.findByLocationNearAndTitle(center, radius, filters.q())
                : repository.findByLocationNear(center, radius);
        return hits.stream()
                .filter(doc -> doc.getLocation() != null)
                .filter(doc -> matches(doc, filters))
                .map(doc -> toResult(doc, lat, lng))
                .sorted(Comparator.comparingDouble(DropInSearchResult::distanceKm))
                .toList();
    }

    private static boolean matches(DropInDocument doc, NearbyFilters f) {
        if (f.skill() != null && !f.skill().equalsIgnoreCase(doc.getSkillLevel())) {
            return false;
        }
        if (f.maxPrice() != null && (doc.getPrice() == null || doc.getPrice() > f.maxPrice())) {
            return false;
        }
        Instant start = doc.getStartTime();
        if (f.from() != null && (start == null || start.isBefore(f.from()))) {
            return false;
        }
        if (f.to() != null && (start == null || start.isAfter(f.to()))) {
            return false;
        }
        return true;
    }

    private DropInSearchResult toResult(DropInDocument doc, double fromLat, double fromLng) {
        GeoPoint loc = doc.getLocation();
        double distanceKm = haversineKm(fromLat, fromLng, loc.getLat(), loc.getLon());
        return new DropInSearchResult(
                doc.getId(), doc.getTitle(), doc.getCourtId(), doc.getCity(),
                loc.getLat(), loc.getLon(), distanceKm,
                doc.getPrice(), doc.getSkillLevel(), doc.getStartTime());
    }

    /** Great-circle distance between two lat/lng points, in kilometres. */
    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
