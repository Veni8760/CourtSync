package com.courtsync.dropins.rsvp.domain;

import java.time.Instant;
import java.util.UUID;

import com.courtsync.dropins.dropin.domain.DropIn;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.Setter;

/**
 * One RSVP: a player's row against a drop-in ({@code drop_in_players}).
 *
 * The @ManyToOne to DropIn is the JPA mirror of the drop_in_id foreign key:
 * many players belong to one drop-in. This import (rsvp → dropin) is the ONLY
 * allowed direction between the two feature packages. fetch = LAZY means loading
 * a player does NOT auto-load the whole DropIn — Hibernate only fires that query
 * if we actually touch dropIn.
 *
 * user_id stays a bare UUID (user-service owns users). The @UniqueConstraint
 * mirrors the DB's UNIQUE(drop_in_id, user_id) so the mapping documents the
 * invariant; the real enforcement is the DB constraint.
 */
@Entity
@Table(
        name = "drop_in_players",
        uniqueConstraints = @UniqueConstraint(
                name = "drop_in_players_unique",
                columnNames = {"drop_in_id", "user_id"}))
@Getter
@Setter
public class DropInPlayer {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "drop_in_id", nullable = false)
    private DropIn dropIn;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rsvp_status", nullable = false)
    private RsvpStatus rsvpStatus = RsvpStatus.CONFIRMED;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.NOT_REQUIRED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
