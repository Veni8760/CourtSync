# CourtSync Event Contracts

Canonical JSON shapes for Kafka events, shared by producers and consumers.
Mirrors MASTER §9. Kafka means **"something happened, others may react"** — never
request/response. Normal reads/writes use REST.

## Topics

| Topic            | Producer            | Consumers (skeleton)                  |
| ---------------- | ------------------- | ------------------------------------- |
| `user-events`    | user-service        | —                                     |
| `court-events`   | court-service       | search-service                        |
| `dropin-events`  | dropin-service      | notification-service, search-service  |
| `payment-events` | payment-service     | —                                     |
| `message-events` | messaging-service   | —                                     |
| `search-events`  | search-service      | —                                     |

The load-bearing topic for the first milestone is **`dropin-events`**.

Every event carries an `eventType` discriminator and an ISO-8601 `timestamp`.

## Events

### USER_CREATED — `user-events`
```json
{ "eventType": "USER_CREATED", "userId": "uuid", "email": "user@example.com", "timestamp": "2026-06-09T12:00:00Z" }
```

### COURT_CREATED — `court-events`
```json
{ "eventType": "COURT_CREATED", "courtId": "uuid", "name": "Toronto Volleyball Centre", "city": "Toronto", "province": "ON", "timestamp": "2026-06-09T12:00:00Z" }
```

### DROP_IN_CREATED — `dropin-events`
```json
{ "eventType": "DROP_IN_CREATED", "dropInId": "uuid", "courtId": "uuid", "organizerUserId": "uuid", "startTime": "2026-06-12T19:00:00Z", "surface": "INDOOR", "timestamp": "2026-06-09T12:00:00Z" }
```

### RSVP_CREATED — `dropin-events`
```json
{ "eventType": "RSVP_CREATED", "dropInId": "uuid", "userId": "uuid", "paymentRequired": false, "amount": 0, "timestamp": "2026-06-09T12:00:00Z" }
```

### RSVP_CANCELLED — `dropin-events`
```json
{ "eventType": "RSVP_CANCELLED", "dropInId": "uuid", "userId": "uuid", "timestamp": "2026-06-09T12:00:00Z" }
```

### DROP_IN_CANCELLED — `dropin-events`
```json
{ "eventType": "DROP_IN_CANCELLED", "dropInId": "uuid", "organizerUserId": "uuid", "timestamp": "2026-06-09T12:00:00Z" }
```

### PAYMENT_SUCCEEDED — `payment-events`
```json
{ "eventType": "PAYMENT_SUCCEEDED", "paymentId": "uuid", "dropInId": "uuid", "userId": "uuid", "amount": 10.00, "currency": "CAD", "timestamp": "2026-06-09T12:00:00Z" }
```

### PAYMENT_FAILED — `payment-events`
```json
{ "eventType": "PAYMENT_FAILED", "paymentId": "uuid", "dropInId": "uuid", "userId": "uuid", "reason": "Payment declined", "timestamp": "2026-06-09T12:00:00Z" }
```

### MESSAGE_SENT — `message-events`
```json
{ "eventType": "MESSAGE_SENT", "messageId": "uuid", "dropInId": "uuid", "senderUserId": "uuid", "timestamp": "2026-06-09T12:00:00Z" }
```

## Consumer note

`notification-service` (Go) currently decodes `dropin-events` into the RSVP shape and
logs `RSVP_CREATED` / `RSVP_CANCELLED` (see `services/notification-service/internal/handlers/rsvp.go`).
It also logs `DROP_IN_CANCELLED` events (organizer-initiated cancellation) from the same topic.
