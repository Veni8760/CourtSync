package com.courtsync.notifications.alert.domain;

/**
 * What happened, from the recipient's point of view. Deliberately NOT the same
 * vocabulary as the Kafka event names: an event describes a system fact
 * ("RSVP_CREATED"), an alert describes a thing that happened to *you*.
 *
 *   RSVP_CONFIRMED    — you got a spot.
 *   WAITLISTED        — the session was full, you're in the queue.
 *   PROMOTED          — a spot opened and it's yours. The one that's time-critical.
 *   DROP_IN_CANCELLED — the organizer called the session off.
 */
public enum AlertType {
    RSVP_CONFIRMED,
    WAITLISTED,
    PROMOTED,
    DROP_IN_CANCELLED
}
