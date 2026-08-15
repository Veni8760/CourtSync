package com.courtsync.notifications.alert.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.Setter;

/**
 * One alert addressed to one player ({@code alerts}). The aggregate root of this
 * service — and the only one.
 *
 * user_id / drop_in_id are bare UUIDs, NOT JPA relationships: those rows live in
 * other services' schemas and we must not map across that boundary.
 *
 * eventKey is what makes the Kafka consumer idempotent. Kafka delivers
 * at-least-once, so a rebalance or restart can replay a message; the DB's
 * UNIQUE (user_id, drop_in_id, event_key) turns the replay into a rejected insert
 * instead of a duplicate alert in someone's feed.
 */
@Entity
@Table(
        name = "alerts",
        uniqueConstraints = @UniqueConstraint(
                name = "alerts_event_unique",
                columnNames = {"user_id", "drop_in_id", "event_key"}))
@Getter
@Setter
public class Alert {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "drop_in_id", nullable = false)
    private UUID dropInId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType type;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    /** Identifies the one publish that produced this alert; see the class note. */
    @Column(name = "event_key", nullable = false)
    private String eventKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = Instant.now();
    }
}
