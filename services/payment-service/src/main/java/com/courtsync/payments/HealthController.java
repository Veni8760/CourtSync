package com.courtsync.payments;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness endpoint required of every CourtSync service (MASTER §16).
 * Returns {"service":"payment-service","status":"UP"} so orchestrators and the
 * gateway can confirm the service booted without touching domain logic.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "payment-service", "status", "UP");
    }
}
