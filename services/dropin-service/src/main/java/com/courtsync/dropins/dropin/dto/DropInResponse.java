package com.courtsync.dropins.dropin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.domain.DropInStatus;

/**
 * Outgoing JSON for a drop-in. Built from a DropIn entity via {@link #from}.
 * confirmedPlayers comes straight off the entity's counter (no COUNT query), and
 * spotsLeft is derived — both are what the UI needs to render "7 / 10, 3 left".
 */
public record DropInResponse(
        UUID id,
        UUID courtId,
        UUID organizerUserId,
        String title,
        String description,
        Instant startTime,
        Instant endTime,
        int maxPlayers,
        int confirmedPlayers,
        int spotsLeft,
        BigDecimal price,
        String skillLevel,
        DropInStatus status,
        Instant createdAt,
        Instant updatedAt) {

    public static DropInResponse from(DropIn d) {
        int spotsLeft = Math.max(0, d.getMaxPlayers() - d.getConfirmedPlayers());
        return new DropInResponse(
                d.getId(),
                d.getCourtId(),
                d.getOrganizerUserId(),
                d.getTitle(),
                d.getDescription(),
                d.getStartTime(),
                d.getEndTime(),
                d.getMaxPlayers(),
                d.getConfirmedPlayers(),
                spotsLeft,
                d.getPrice(),
                d.getSkillLevel(),
                d.getStatus(),
                d.getCreatedAt(),
                d.getUpdatedAt());
    }
}
