package com.courtsync.dropins.dropin.domain;

/**
 * Lifecycle of a drop-in session (MASTER §8.4).
 *   OPEN      — accepting RSVPs.
 *   FULL      — at capacity; set when the last spot is taken.
 *   CANCELLED — organizer cancelled (not used in the skeleton yet).
 * Persisted as the name string ("OPEN"), never the ordinal.
 */
public enum DropInStatus {
    OPEN,
    FULL,
    CANCELLED
}
