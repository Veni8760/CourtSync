package com.courtsync.notifications.alert.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.courtsync.notifications.alert.domain.Alert;

/**
 * Data access for alerts. Spring Data derives most of the SQL from method names;
 * the two @Modifying queries are bulk updates, deliberately written as one
 * statement rather than load-mutate-save over a whole feed.
 */
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    /** The feed: this user's alerts, newest first. */
    List<Alert> findTop50ByUserIdOrderByCreatedAtDesc(UUID userId);

    /** The badge. Cached in Redis by AlertService — this is the miss path. */
    long countByUserIdAndReadFalse(UUID userId);

    /**
     * Whether a given publish has already been turned into an alert for this user.
     * Checked before insert so a Kafka redelivery is a no-op rather than a
     * constraint violation that would fail the whole batch.
     */
    boolean existsByUserIdAndDropInIdAndEventKey(UUID userId, UUID dropInId, String eventKey);

    /**
     * The recipients of any future alert about this drop-in: everyone we have
     * already written an alert to for it.
     *
     * NOTE: this makes the alerts table double as the roster, so notification-service
     * can fan a DROP_IN_CANCELLED out without asking dropin-service who was
     * playing (which would be a synchronous read across a service boundary) and
     * without dropin-service's cancel path having to reach into its own rsvp
     * package (which would create the feature-package cycle CLAUDE.md forbids).
     * The cost is that a player who already cancelled still gets told the session
     * was called off — noise, not incorrectness.
     */
    @Query("select distinct a.userId from Alert a where a.dropInId = :dropInId")
    List<UUID> findRecipientsByDropInId(@Param("dropInId") UUID dropInId);

    /** Mark one alert read, scoped to its owner so a stolen id is a no-op. */
    @Modifying
    @Query("update Alert a set a.read = true where a.id = :id and a.userId = :userId")
    int markRead(@Param("id") UUID id, @Param("userId") UUID userId);

    /** Clear the whole badge in one statement. */
    @Modifying
    @Query("update Alert a set a.read = true where a.userId = :userId and a.read = false")
    int markAllRead(@Param("userId") UUID userId);
}
