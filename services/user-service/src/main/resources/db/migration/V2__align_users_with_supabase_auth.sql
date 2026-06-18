ALTER TABLE users.users
    ADD COLUMN IF NOT EXISTS role VARCHAR(50);

UPDATE users.users
SET role = 'PLAYER'
WHERE role IS NULL;

ALTER TABLE users.users
    ALTER COLUMN role SET DEFAULT 'PLAYER',
    ALTER COLUMN role SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_chk'
          AND conrelid = 'users.users'::regclass
    ) THEN
        ALTER TABLE users.users
            ADD CONSTRAINT users_role_chk
            CHECK (role IN ('PLAYER', 'ORGANIZER', 'ADMIN'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_auth_user_fk'
          AND conrelid = 'users.users'::regclass
    ) THEN
        ALTER TABLE users.users
            ADD CONSTRAINT users_auth_user_fk
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE users.users ENABLE ROW LEVEL SECURITY;
