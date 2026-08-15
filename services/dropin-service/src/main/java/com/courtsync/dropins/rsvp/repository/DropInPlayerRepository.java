package com.courtsync.dropins.rsvp.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.courtsync.dropins.rsvp.domain.DropInPlayer;
import com.courtsync.dropins.rsvp.domain.RsvpStatus;

/**
 * Data access for RSVPs. Spring Data derives the SQL from the method NAMES.
 * "findByDropInIdAndUserId" traverses the dropIn relationship to its id, i.e.
 * WHERE drop_in_id = ? AND user_id = ?. No SQL written by hand.
 *
 * Note: there's no count-of-players method here anymore — the confirmed count
 * lives on the drop-in's confirmed_players counter, so reads never COUNT(*).
 */
public interface DropInPlayerRepository extends JpaRepository<DropInPlayer, UUID> {

    /** A specific user's RSVP row, to cancel it or detect a duplicate. */
    Optional<DropInPlayer> findByDropInIdAndUserId(UUID dropInId, UUID userId);

    /** All players for a drop-in's detail view. */
    List<DropInPlayer> findByDropInId(UUID dropInId);

    /**
     * A user's RSVP rows in a given status, WITH the drop-in eagerly loaded — the
     * "my drop-ins I RSVP'd to" list. The {@code join fetch} avoids an N+1 (one
     * extra SELECT per row for the lazy {@code dropIn}) since we map every row to
     * its drop-in.
     */
    @Query("select p from DropInPlayer p join fetch p.dropIn "
         + "where p.userId = :userId and p.rsvpStatus = :status")
    List<DropInPlayer> findWithDropInByUserIdAndRsvpStatus(
            @Param("userId") UUID userId, @Param("status") RsvpStatus status);

    /**
     * The next player in line: the WAITLISTED row that has waited longest. Read
     * under the drop-in's row lock during cancellation, so two concurrent
     * cancellations can't promote the same person twice.
     */
    Optional<DropInPlayer> findFirstByDropInIdAndRsvpStatusOrderByWaitlistedAtAsc(
            UUID dropInId, RsvpStatus rsvpStatus);

    /**
     * How many waitlisted players joined before {@code waitlistedAt} — the
     * derived display position is this count plus one. Cheaper and race-free
     * compared with storing (and renumbering) an integer position column.
     */
    long countByDropInIdAndRsvpStatusAndWaitlistedAtLessThan(
            UUID dropInId, RsvpStatus rsvpStatus, Instant waitlistedAt);
}
