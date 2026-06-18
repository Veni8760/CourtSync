package com.courtsync.search.common;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness endpoint required of every CourtSync service (MASTER §16).
 * Lives in {@code common/} because it's service-wide infrastructure, not part of
 * the search feature.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "search-service", "status", "UP");
    }
}
