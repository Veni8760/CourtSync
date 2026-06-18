package com.courtsync.dropins.rsvp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courtsync.dropins.rsvp.domain.DropInPlayer;

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
}
