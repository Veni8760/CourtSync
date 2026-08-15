-- Notification Service initial schema: the per-player alert feed.
--
-- One row per alert shown to one user. Alerts are DERIVED — they are written only
-- by the dropin-events Kafka consumer, never by a REST call. The REST API is
-- read-and-mark-read only.
--
-- Cross-service note (MASTER §7): user_id and drop_in_id reference rows OWNED BY
-- OTHER SERVICES (user-service, dropin-service). They are plain UUIDs with NO
-- foreign key — a service never reaches into another service's tables.

CREATE TABLE alerts (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL,
    drop_in_id  UUID NOT NULL,
    type        VARCHAR(32) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT alerts_type_chk CHECK (type IN (
        'RSVP_CONFIRMED', 'WAITLISTED', 'PROMOTED', 'DROP_IN_CANCELLED')),

    -- Kafka gives at-least-once delivery, so the same event can be redelivered
    -- after a consumer restart. This makes the consumer idempotent: a redelivered
    -- event collides here instead of duplicating the user's alert. (event_key is
    -- eventType + the event timestamp, which together identify one publish.)
    event_key   VARCHAR(128) NOT NULL,
    CONSTRAINT alerts_event_unique UNIQUE (user_id, drop_in_id, event_key)
);

-- The feed query: "my alerts, newest first".
CREATE INDEX alerts_user_created_idx ON alerts (user_id, created_at DESC);

-- The badge query: "how many unread do I have". Partial, because read alerts are
-- the overwhelming majority once a feed has any age.
CREATE INDEX alerts_user_unread_idx ON alerts (user_id) WHERE is_read = FALSE;
