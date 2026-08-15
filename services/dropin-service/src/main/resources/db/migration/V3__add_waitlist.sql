-- Waitlist support for drop_in_players.
--
-- Before this migration, RSVPing to a full drop-in was a hard 409. Now the
-- player joins a FIFO waitlist instead, and cancelling a confirmed RSVP promotes
-- whoever has waited longest. 'WAITLISTED' was already allowed by the
-- rsvp_status CHECK in V1 — this migration makes it load-bearing.
--
-- Why a timestamp and not an integer position:
--   * A position column has to be renumbered on every promotion, and the
--     renumbering has to stay unique under concurrency. A timestamp never moves.
--   * created_at can't stand in for it. Re-RSVP REUSES the existing row (the
--     UNIQUE (drop_in_id, user_id) constraint forbids a second one), so a player
--     who cancelled and then re-joined would keep their original created_at and
--     unfairly jump the queue. waitlisted_at is stamped each time they join.
-- Display position ("Waitlist #3") is derived: count the waitlisted rows for the
-- drop-in with an earlier waitlisted_at, plus one.

ALTER TABLE drop_in_players ADD COLUMN waitlisted_at TIMESTAMPTZ;

-- The column is meaningful only while the row is WAITLISTED, and it is REQUIRED
-- while the row is WAITLISTED. Stating both halves as one equality keeps the two
-- fields from drifting apart: promotion must clear it, enqueue must set it.
ALTER TABLE drop_in_players ADD CONSTRAINT drop_in_players_waitlisted_at_chk
    CHECK ((rsvp_status = 'WAITLISTED') = (waitlisted_at IS NOT NULL));

-- Covers the two waitlist reads: "who is next" (ORDER BY ... LIMIT 1) and
-- "what position am I" (COUNT of earlier rows). Partial, because only a small
-- fraction of rows are ever waitlisted.
CREATE INDEX drop_in_players_waitlist_idx
    ON drop_in_players (drop_in_id, waitlisted_at)
    WHERE rsvp_status = 'WAITLISTED';
