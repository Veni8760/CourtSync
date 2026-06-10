package com.courtsync.courts.court;

/**
 * Where the court is played, modeled as a single flat enum so illegal states are
 * unrepresentable (you can't have "indoor + grass"). Indoor courts are INDOOR;
 * outdoor courts are GRASS or BEACH. "Is it indoor?" == (surface == INDOOR).
 * Stored as its name string via @Enumerated(EnumType.STRING).
 */
public enum Surface {
    INDOOR,
    GRASS,
    BEACH
}
