-- One Postgres container, one database per service (MASTER §7, §13).
-- Runs automatically on first container start via /docker-entrypoint-initdb.d.
-- Owned by the default POSTGRES_USER (courtsync).
CREATE DATABASE courtsync_users;
CREATE DATABASE courtsync_courts;
CREATE DATABASE courtsync_dropins;
CREATE DATABASE courtsync_messages;
CREATE DATABASE courtsync_payments;
