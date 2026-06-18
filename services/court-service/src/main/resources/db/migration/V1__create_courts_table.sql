-- Court Service initial schema (MASTER §8.3, refined).
-- Flyway runs this once, on first boot, and records it in flyway_schema_history
-- so it never re-runs. Once this has been applied anywhere, NEVER edit it —
-- make further changes in V2__, V3__, ...
--
-- Design notes:
--   surface     — flat enum (INDOOR | GRASS | BEACH). Illegal combos like
--                 "indoor grass" are unrepresentable. Indoor = surface 'INDOOR'.
--   net_height  — MENS | WOMENS | COED. Independent of surface.
-- (Replaces the original court_type + indoor columns, which conflated environment,
--  surface, and venue into one messy enum.)
CREATE TABLE courts (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    address     VARCHAR(255),
    city        VARCHAR(100),
    province    VARCHAR(100),
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    surface     VARCHAR(20) NOT NULL,
    net_height  VARCHAR(20) NOT NULL,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    -- Defence-in-depth: the app (Java enum + @NotNull) already rejects bad values,
    -- but these CHECK constraints make the DB itself refuse any row outside the
    -- allowed set — even a manual psql INSERT. Named so future migrations can
    -- ALTER them. Keep these IN lists in sync with Surface.java / NetHeight.java.
    CONSTRAINT courts_surface_chk    CHECK (surface    IN ('INDOOR', 'GRASS', 'BEACH')),
    CONSTRAINT courts_net_height_chk CHECK (net_height IN ('MENS', 'WOMENS', 'COED'))
);
