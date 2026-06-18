package com.courtsync.dropins.dropin.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.courtsync.dropins.dropin.domain.DropIn;

import jakarta.persistence.LockModeType;

/**
 * Data access for drop-ins. Basic CRUD comes free from JpaRepository.
 *
 * findByIdForUpdate is the concurrency-critical method: PESSIMISTIC_WRITE makes
 * Hibernate emit "SELECT ... FOR UPDATE", taking a row lock on this drop-in.
 * Two simultaneous RSVPs to the last spot are forced to run one-at-a-time — the
 * second blocks until the first commits, then sees the updated confirmed_players.
 * This is what makes "prevent RSVP when full" correct under load.
 */
public interface DropInRepository extends JpaRepository<DropIn, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DropIn d where d.id = :id")
    Optional<DropIn> findByIdForUpdate(@Param("id") UUID id);
}
