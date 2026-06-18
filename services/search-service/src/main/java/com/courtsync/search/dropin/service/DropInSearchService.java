package com.courtsync.search.dropin.service;

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

    // Cache by ~100m-rounded coordinates + radius so repeated "near me" queries from
    // the same spot hit Redis instead of Elasticsearch (the "sub-second" win). 60s TTL.
    @Cacheable(cacheNames = CacheConfig.NEARBY_CACHE,
            key = "T(java.lang.Math).round(#lat*1000) + ':' + T(java.lang.Math).round(#lng*1000) + ':' + #radiusKm")
    public List<DropInSearchResult> findNearby(double lat, double lng, double radiusKm) {
        GeoPoint center = new GeoPoint(lat, lng);
        Distance radius = new Distance(radiusKm, Metrics.KILOMETERS);

        return repository.findByLocationNear(center, radius).stream()
                .filter(doc -> doc.getLocation() != null)
                .map(doc -> toResult(doc, lat, lng))
                // ponytail: sort in-app; push to an ES geo_distance sort if result sets ever grow large.
                .sorted(Comparator.comparingDouble(DropInSearchResult::distanceKm))
                .toList();
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
