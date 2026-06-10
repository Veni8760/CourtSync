package com.courtsync.courts.court.dto;

import java.time.Instant;
import java.util.UUID;

import com.courtsync.courts.court.Court;
import com.courtsync.courts.court.NetHeight;
import com.courtsync.courts.court.Surface;

/**
 * Outgoing JSON for GET/POST /courts. Built from a Court entity via {@link #from}.
 * Returning this (not the entity) keeps our wire format stable even if the table changes.
 */
public record CourtResponse(
        UUID id,
        String name,
        String address,
        String city,
        String province,
        Double latitude,
        Double longitude,
        Surface surface,
        NetHeight netHeight,
        Instant createdAt,
        Instant updatedAt) {

    public static CourtResponse from(Court c) {
        return new CourtResponse(
                c.getId(),
                c.getName(),
                c.getAddress(),
                c.getCity(),
                c.getProvince(),
                c.getLatitude(),
                c.getLongitude(),
                c.getSurface(),
                c.getNetHeight(),
                c.getCreatedAt(),
                c.getUpdatedAt());
    }
}
