-- Drop-In Service initial schema (MASTER §8.4).
-- Flyway runs this once on first boot and records it in flyway_schema_history,
-- so it never re-runs. Once applied anywhere, NEVER edit it — add V2__, V3__, ...
--
-- Two tables, a classic one-to-many:
--   drop_ins         — one volleyball session (court, time window, capacity).
--   drop_in_players  — one row per RSVP; many rows point back to one drop_in.
--
-- Cross-service note (MASTER §7): court_id / organizer_user_id reference rows
-- OWNED BY OTHER SERVICES (court-service, user-service). We therefore store them
-- as plain UUIDs with NO foreign key — a service never reaches into another
-- service's tables. Validation that the court/user exists happens via REST later.

CREATE TABLE drop_ins (
    id                 UUID PRIMARY KEY,
    court_id           UUID NOT NULL,
    organizer_user_id  UUID NOT NULL,
    title              VARCHAR(255) NOT NULL,
    description        TEXT,
    start_time         TIMESTAMPTZ NOT NULL,
    end_time           TIMESTAMPTZ NOT NULL,
    max_players        INTEGER NOT NULL,

    -- Denormalized counter of CONFIRMED RSVPs. We keep it on the drop-in so the
    -- list/detail views can show "spots left" by reading ONE row, instead of
    -- COUNT(*)-ing drop_in_players on every read. The RSVP flow maintains it
    -- (+1 on RSVP, -1 on cancel) inside the same locked transaction, so it can
    -- never drift. This also keeps the rsvp package depending on dropin and NOT
    -- the reverse (no circular dependency).
    confirmed_players  INTEGER NOT NULL DEFAULT 0,

    price              DECIMAL(10, 2) NOT NULL DEFAULT 0,
    skill_level        VARCHAR(50),
    status             VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- DB-level invariants (defence-in-depth; the app validates these too):
    CONSTRAINT drop_ins_time_chk        CHECK (end_time > start_time),
    CONSTRAINT drop_ins_max_players_chk CHECK (max_players > 0),
    CONSTRAINT drop_ins_price_chk       CHECK (price >= 0),
    CONSTRAINT drop_ins_status_chk      CHECK (status IN ('OPEN', 'FULL', 'CANCELLED')),
    -- The counter can never go negative or exceed capacity. If a bug ever tried,
    -- the DB rejects the write — the invariant is guaranteed at the lowest level.
    CONSTRAINT drop_ins_confirmed_chk   CHECK (confirmed_players >= 0
                                               AND confirmed_players <= max_players)
);

CREATE TABLE drop_in_players (
    id              UUID PRIMARY KEY,
    drop_in_id      UUID NOT NULL,
    user_id         UUID NOT NULL,
    rsvp_status     VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    payment_status  VARCHAR(20) NOT NULL DEFAULT 'NOT_REQUIRED',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- The load-bearing correctness guarantee: one user can RSVP to a given
    -- drop-in at most once. Enforced by the DB, so even a race or a bug cannot
    -- create a duplicate RSVP.
    CONSTRAINT drop_in_players_unique UNIQUE (drop_in_id, user_id),

    CONSTRAINT drop_in_players_rsvp_status_chk
        CHECK (rsvp_status IN ('CONFIRMED', 'CANCELLED', 'WAITLISTED')),
    CONSTRAINT drop_in_players_payment_status_chk
        CHECK (payment_status IN ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')),

    -- Within this service we CAN use a foreign key: drop_in_players belongs to
    -- drop_ins, both owned here. ON DELETE CASCADE means deleting a drop-in
    -- removes its RSVPs automatically.
    CONSTRAINT drop_in_players_drop_in_fk
        FOREIGN KEY (drop_in_id) REFERENCES drop_ins (id) ON DELETE CASCADE
);

-- Index the lookup we do on every RSVP / detail view: "all players for a drop-in".
CREATE INDEX drop_in_players_drop_in_idx ON drop_in_players (drop_in_id);
