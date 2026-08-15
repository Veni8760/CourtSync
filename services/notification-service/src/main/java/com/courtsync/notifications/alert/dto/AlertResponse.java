package com.courtsync.notifications.alert.dto;

import java.time.Instant;
import java.util.UUID;

import com.courtsync.notifications.alert.domain.Alert;
import com.courtsync.notifications.alert.domain.AlertType;

/**
 * Outgoing JSON for one alert. {@code dropInId} lets the frontend link the alert
 * straight to the session it is about; {@code eventKey} is an internal
 * idempotency detail and is deliberately not on the wire.
 */
public record AlertResponse(
        UUID id,
        UUID dropInId,
        AlertType type,
        String message,
        boolean read,
        Instant createdAt) {

    public static AlertResponse from(Alert a) {
        return new AlertResponse(
                a.getId(),
                a.getDropInId(),
                a.getType(),
                a.getMessage(),
                a.isRead(),
                a.getCreatedAt());
    }
}
