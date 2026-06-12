package com.courtsync.users.common;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness endpoint required of every CourtSync service (MASTER §16).
 * Returns {"service":"user-service","status":"UP"} so orchestrators and the
 * gateway can confirm the service booted without touching domain logic.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "user-service", "status", "UP");
    }
}
