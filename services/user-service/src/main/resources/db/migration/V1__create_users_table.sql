CREATE TABLE users (
    id           UUID PRIMARY KEY,
    email        VARCHAR(255) UNIQUE NOT NULL,
    first_name   VARCHAR(100),
    last_name    VARCHAR(100),
    skill_level  VARCHAR(50),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_skill_level_chk CHECK (
        skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE'))
);
