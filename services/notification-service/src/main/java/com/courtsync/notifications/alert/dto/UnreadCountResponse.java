package com.courtsync.notifications.alert.dto;

/** The bell badge. Its own record so the endpoint returns an object, not a bare number. */
public record UnreadCountResponse(long unread) {
}
