package com.courtsync.search.dropin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import com.courtsync.search.dropin.document.DropInDocument;
import com.courtsync.search.dropin.dto.DropInSearchResult;
import com.courtsync.search.dropin.dto.NearbyFilters;
import com.courtsync.search.dropin.repository.DropInSearchRepository;

/**
 * Elasticsearch does the radius filter (verified at runtime); this checks the
 * app-side contract: results come back nearest-first with a sane distance. Two
 * docs around downtown Toronto, returned by the repo out of order.
 */
@ExtendWith(MockitoExtension.class)
class DropInSearchServiceTest {

    @Mock
    private DropInSearchRepository repository;
    @InjectMocks
    private DropInSearchService service;

    private DropInDocument doc(String id, double lat, double lon) {
        DropInDocument d = new DropInDocument();
        d.setId(id);
        d.setLocation(new GeoPoint(lat, lon));
        return d;
    }

    @Test
    void returnsNearestFirstWithDistance() {
        double lat = 43.6532, lng = -79.3832; // downtown Toronto
        DropInDocument near = doc("near", 43.66, -79.39);  // ~1 km
        DropInDocument far = doc("far", 43.77, -79.50);    // ~17 km

        // Repo returns them out of order; the service must sort.
        when(repository.findByLocationNear(any(GeoPoint.class), any())).thenReturn(List.of(far, near));

        List<DropInSearchResult> results = service.findNearby(lat, lng, 50, NearbyFilters.NONE);

        assertThat(results).extracting(DropInSearchResult::id).containsExactly("near", "far");
        assertThat(results.get(0).distanceKm()).isLessThan(results.get(1).distanceKm());
        assertThat(results.get(0).distanceKm()).isLessThan(5.0); // ~1 km, sanity bound
    }

    @Test
    void filtersNarrowResults() {
        double lat = 43.6532, lng = -79.3832;
        Instant sat = Instant.parse("2026-06-20T18:00:00Z");
        Instant sun = Instant.parse("2026-06-21T18:00:00Z");

        DropInDocument cheapBeginnerSat = doc("a", 43.66, -79.39);
        cheapBeginnerSat.setSkillLevel("Beginner");
        cheapBeginnerSat.setPrice(10.0);
        cheapBeginnerSat.setStartTime(sat);

        DropInDocument pricyAdvancedSun = doc("b", 43.67, -79.40);
        pricyAdvancedSun.setSkillLevel("Advanced");
        pricyAdvancedSun.setPrice(30.0);
        pricyAdvancedSun.setStartTime(sun);

        when(repository.findByLocationNear(any(GeoPoint.class), any()))
                .thenReturn(List.of(cheapBeginnerSat, pricyAdvancedSun));

        // skill filter
        assertThat(service.findNearby(lat, lng, 50, new NearbyFilters("Beginner", null, null, null)))
                .extracting(DropInSearchResult::id).containsExactly("a");
        // maxPrice filter
        assertThat(service.findNearby(lat, lng, 50, new NearbyFilters(null, 15.0, null, null)))
                .extracting(DropInSearchResult::id).containsExactly("a");
        // date-window filter (Saturday only)
        assertThat(service.findNearby(lat, lng, 50,
                new NearbyFilters(null, null, sat.minusSeconds(3600), sat.plusSeconds(3600))))
                .extracting(DropInSearchResult::id).containsExactly("a");
        // no filter → both
        assertThat(service.findNearby(lat, lng, 50, NearbyFilters.NONE))
                .extracting(DropInSearchResult::id).containsExactlyInAnyOrder("a", "b");
    }
}
