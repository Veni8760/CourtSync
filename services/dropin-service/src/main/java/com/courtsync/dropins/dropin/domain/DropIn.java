package com.courtsync.dropins.dropin.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.courtsync.dropins.dropin.exception.DropInFullException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;

/**
 * A volleyball drop-in session (MASTER §8.4) — the aggregate ROOT of this
 * service. One @Entity = one row in {@code drop_ins}.
 *
 * This is a "rich" domain object: the capacity rule lives HERE, in reserveSpot()
 * / releaseSpot(), not in a service. The object protects its own invariant
 * (confirmedPlayers can never exceed maxPlayers), so no caller can bypass it.
 *
 * court_id / organizer_user_id are bare UUIDs, NOT JPA relationships: those rows
 * live in other services' schemas and we must not map across that boundary.
 *
 * Note there is deliberately NO @OneToMany to DropInPlayer. The relationship is
 * modelled only from the child side (DropInPlayer → DropIn). Adding the reverse
 * link would make the dropin package depend on the rsvp package and create a
 * cycle; the confirmed_players counter is what lets us avoid that.
 */
@Entity
@Table(name = "drop_ins")
@Getter
@Setter
public class DropIn {

    @Id
    private UUID id;

    @Column(name = "court_id", nullable = false)
    private UUID courtId;

    @Column(name = "organizer_user_id", nullable = false)
    private UUID organizerUserId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "max_players", nullable = false)
    private int maxPlayers;

    /** Live count of CONFIRMED RSVPs, maintained by reserveSpot/releaseSpot. */
    @Column(name = "confirmed_players", nullable = false)
    private int confirmedPlayers = 0;

    /** Money → BigDecimal, never double (floating point can't represent cents exactly). */
    @Column(nullable = false)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "skill_level")
    private String skillLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DropInStatus status = DropInStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Take one spot for a new RSVP. Throws if the drop-in is already full, and
     * flips status to FULL when this RSVP takes the last spot.
     *
     * Callers MUST hold the pessimistic row lock (see DropInRepository
     * .findByIdForUpdate) before calling this — otherwise two concurrent RSVPs
     * could both pass the capacity check. The lock is what makes this safe.
     */
    public void reserveSpot() {
        if (confirmedPlayers >= maxPlayers) {
            throw new DropInFullException(id);
        }
        confirmedPlayers++;
        if (confirmedPlayers >= maxPlayers) {
            status = DropInStatus.FULL;
        }
    }

    /** Give back one spot on cancellation; reopens a previously FULL drop-in. */
    public void releaseSpot() {
        if (confirmedPlayers > 0) {
            confirmedPlayers--;
        }
        if (status == DropInStatus.FULL) {
            status = DropInStatus.OPEN;
        }
    }

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
