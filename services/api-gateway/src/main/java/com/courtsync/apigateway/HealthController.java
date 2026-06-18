package com.courtsync.apigateway;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

/**
 * Liveness endpoint required of every CourtSync service (MASTER §16).
 * The gateway runs on WebFlux (reactive), so the handler returns a Mono — a
 * container for a value that resolves asynchronously, non-blocking. Returns
 * {"service":"api-gateway","status":"UP"}.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Mono<Map<String, String>> health() {
        return Mono.just(Map.of("service", "api-gateway", "status", "UP"));
    }
}
