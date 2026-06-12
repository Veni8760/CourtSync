package com.courtsync.courts.court.domain;

/**
 * Where volleyball is played. Flat enum so illegal combos (e.g. "indoor grass")
 * are unrepresentable; indoor courts use INDOOR. Persisted as the name string.
 */
public enum Surface {
    INDOOR,
    GRASS,
    BEACH
}
