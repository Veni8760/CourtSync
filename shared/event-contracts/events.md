# CourtSync Event Contracts

Canonical JSON shapes for Kafka events, shared by producers and consumers.
Kafka means **"something happened, others may react"** — never request/response.
Normal reads/writes use REST; synchronous service-to-service calls use gRPC.

## Topics

| Topic           | Producer       | Consumers                            |
| --------------- | -------------- | ------------------------------------ |
| `user-events`   | user-service   | —                                    |
| `court-events`  | court-service  | search-service                       |
| `dropin-events` | dropin-service | notification-service, search-service |

`dropin-events` is the load-bearing topic: it drives both the Elasticsearch read
model and the player alert feed. Every event on it is **keyed by `dropInId`**, so
Kafka routes all events for one drop-in to the same partition and keeps them in
order (an `RSVP_CREATED` can never be consumed after its own `RSVP_CANCELLED`).

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

Carries the court's location and the card fields denormalized, so search-service
can index a self-sufficient document without calling back to dropin-service.

```json
{ "eventType": "DROP_IN_CREATED", "dropInId": "uuid", "courtId": "uuid", "organizerUserId": "uuid",
  "title": "Tuesday six-pack", "startTime": "2026-06-12T19:00:00Z", "price": 0, "skillLevel": "Intermediate",
  "surface": "INDOOR", "latitude": 43.65, "longitude": -79.38, "city": "Toronto",
  "timestamp": "2026-06-09T12:00:00Z" }
```

### RSVP_CREATED — `dropin-events`
```json
{ "eventType": "RSVP_CREATED", "dropInId": "uuid", "userId": "uuid", "paymentRequired": false, "amount": 0, "timestamp": "2026-06-09T12:00:00Z" }
```

### RSVP_WAITLISTED — `dropin-events`

The drop-in was full, so the player joined the queue instead. `position` is
1-based at publish time, so a consumer can say "you're #3" without asking back.

```json
{ "eventType": "RSVP_WAITLISTED", "dropInId": "uuid", "userId": "uuid", "position": 3, "timestamp": "2026-06-09T12:00:00Z" }
```

### RSVP_PROMOTED — `dropin-events`

A cancellation freed a spot and the longest-waiting player was moved from
WAITLISTED to CONFIRMED. This is the event that makes the waitlist feel
real-time — the promoted player is told without polling.

```json
{ "eventType": "RSVP_PROMOTED", "dropInId": "uuid", "userId": "uuid", "timestamp": "2026-06-09T12:00:00Z" }
```

### RSVP_CANCELLED — `dropin-events`

Published for both a cancelled confirmed spot and a withdrawn waitlist entry.

```json
{ "eventType": "RSVP_CANCELLED", "dropInId": "uuid", "userId": "uuid", "timestamp": "2026-06-09T12:00:00Z" }
```

### DROP_IN_CANCELLED — `dropin-events`
```json
{ "eventType": "DROP_IN_CANCELLED", "dropInId": "uuid", "organizerUserId": "uuid", "timestamp": "2026-06-09T12:00:00Z" }
```

## Consumer notes

Both consumers run in their **own consumer group**, so each receives every message.

- **search-service** (`search-service` group) indexes `DROP_IN_CREATED` into
  Elasticsearch and ignores the rest.
- **notification-service** (`notification-service` group) turns events into
  per-user alerts: `RSVP_CREATED` → "you're in", `RSVP_WAITLISTED` → "you're #N",
  `RSVP_PROMOTED` → "a spot opened", `DROP_IN_CANCELLED` → fan-out to every player
  it has previously alerted about that drop-in.

Delivery is **at-least-once**, so consumers must be idempotent. notification-service
derives an `eventKey` (`eventType@timestamp`) and enforces
`UNIQUE (user_id, drop_in_id, event_key)`, so a redelivered message is rejected
rather than duplicating someone's alert.

Payloads are plain JSON strings. Migrating them to Protobuf is deliberately
**deferred** — it would touch both consumers, the frontend types, and likely a
schema registry, and belongs in its own phase.
