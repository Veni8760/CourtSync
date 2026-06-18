package com.courtsync.courts.court.dto;

import com.courtsync.courts.court.domain.NetHeight;
import com.courtsync.courts.court.domain.Surface;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Incoming body for POST /courts. A record = immutable data carrier.
 * The jakarta.validation annotations are enforced by @Valid in the controller,
 * so bad input is rejected (400) before it ever reaches our service logic.
 */
public record CreateCourtRequest(
        @NotBlank(message = "name is required") String name,
        String address,
        String city,
        String province,
        Double latitude,
        Double longitude,
        @NotNull(message = "surface is required") Surface surface,
        @NotNull(message = "netHeight is required") NetHeight netHeight) {
}
