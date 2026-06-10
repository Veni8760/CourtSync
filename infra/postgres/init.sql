-- One Postgres container, one application database, one schema per service.
-- This mirrors hosted Supabase, where services share the project database but
-- keep ownership boundaries through schemas.
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS courts;
CREATE SCHEMA IF NOT EXISTS dropins;
CREATE SCHEMA IF NOT EXISTS messages;
CREATE SCHEMA IF NOT EXISTS payments;
