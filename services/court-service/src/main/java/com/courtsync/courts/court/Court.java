package com.courtsync.courts.court;

import java.time.Instant;
import java.util.UUID;

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
 * A volleyball court (MASTER §8.3). One @Entity = one row in the {@code courts}
 * table. JPA/Hibernate reads these annotations to map fields ↔ columns.
 */
@Entity
@Table(name = "courts")
@Getter
@Setter
public class Court {

    /** Application-generated UUID (we set it in @PrePersist, not the DB). */
    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String province;
    private Double latitude;
    private Double longitude;

    /** Where it's played; persisted as the enum's name string, e.g. "BEACH". */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Surface surface;

    /** Net height standard; persisted as the enum's name string, e.g. "COED". */
    @Enumerated(EnumType.STRING)
    @Column(name = "net_height", nullable = false)
    private NetHeight netHeight;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    /** Set id + timestamps before the first INSERT. */
    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    /** Bump updated_at on every UPDATE. */
    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
