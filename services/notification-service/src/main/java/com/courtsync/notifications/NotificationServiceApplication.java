package com.courtsync.notifications;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Player alerts. The only *consumer-first* service in CourtSync: it never
 * originates a domain change, it listens to {@code dropin-events} and turns each
 * one into rows in a per-user alert feed, which the frontend reads over REST.
 */
@SpringBootApplication
public class NotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
