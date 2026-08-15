package com.courtsync.notifications.alert.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.courtsync.notifications.alert.dto.AlertResponse;
import com.courtsync.notifications.alert.dto.UnreadCountResponse;
import com.courtsync.notifications.alert.service.AlertService;
import com.courtsync.notifications.common.JwtPrincipal;

import lombok.RequiredArgsConstructor;

/**
 * The player's alert feed:
 *   GET  /alerts               the 50 most recent alerts, newest first
 *   GET  /alerts/unread-count  the bell badge
 *   POST /alerts/{id}/read     mark one read
 *   POST /alerts/read-all      clear the badge
 *
 * There is deliberately no POST /alerts — alerts are derived from Kafka events,
 * never created by a client. WHOSE feed comes from the validated JWT (sub), so
 * there is no userId anywhere in these paths.
 */
@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService service;

    @GetMapping
    public List<AlertResponse> feed(@AuthenticationPrincipal Jwt jwt) {
        return service.feed(JwtPrincipal.userId(jwt));
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@AuthenticationPrincipal Jwt jwt) {
        return new UnreadCountResponse(service.unreadCount(JwtPrincipal.userId(jwt)));
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        service.markRead(id, JwtPrincipal.userId(jwt));
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal Jwt jwt) {
        service.markAllRead(JwtPrincipal.userId(jwt));
    }
}
