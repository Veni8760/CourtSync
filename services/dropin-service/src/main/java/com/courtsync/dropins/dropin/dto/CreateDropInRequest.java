package com.courtsync.dropins.dropin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Incoming body for POST /drop-ins. A record = immutable data carrier.
 * The jakarta.validation annotations are enforced by @Valid in the controller,
 * so malformed input is rejected (400) before our service logic runs.
 *
 * start-before-end is a CROSS-FIELD rule a single-field annotation can't express,
 * so the service checks it and returns 400 there.
 *
 * The organizer is NOT in the body — it comes from the authenticated JWT (sub).
 */
public record CreateDropInRequest(
        @NotNull(message = "courtId is required") UUID courtId,
        @NotBlank(message = "title is required") String title,
        String description,
        @NotNull(message = "startTime is required") @Future(message = "startTime must be in the future") Instant startTime,
        @NotNull(message = "endTime is required") Instant endTime,
        @Min(value = 1, message = "maxPlayers must be at least 1") int maxPlayers,
        @PositiveOrZero(message = "price cannot be negative") BigDecimal price,
        String skillLevel) {
}
