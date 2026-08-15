# CourtSync — MASTER.md

The canonical spec. This describes **the system that exists**, not a wishlist. If a
service, table, event, or feature isn't in here, it isn't in scope — adding it needs a
reason, not just an idea.

---

## 1. Scope

CourtSync is a volleyball drop-in platform. Its scope is fixed by three claims:

1. A drop-in app on **Next.js** with **Spring Boot microservices over gRPC** for court
   discovery, scheduling, and player flows.
2. An event-driven backend on **Apache Kafka and Redis** for real-time drop-ins, RSVPs,
   **waitlists**, and **player alerts**.
3. Sub-second **geo-search** for nearby drop-ins via **Elasticsearch** indexes layered
   over PostgreSQL.

Everything below serves one of those three. Explicitly **out of scope**: payments,
in-app messaging/chat, communities, facility booking with hold/commit sagas, analytics,
Kubernetes. They were in an earlier draft of this document and have been cut.

## 2. The end-to-end flow

```
sign up (Supabase auth)
  → create a court
  → create a drop-in at that court   [dropin → court over gRPC: does this court exist?]
      → DROP_IN_CREATED on dropin-events
          → search-service indexes it into Elasticsearch
  → find nearby drop-ins on a map     [geo query, Redis-cached]
  → RSVP
      → spot free?  CONFIRMED  → RSVP_CREATED    → alert: "you're in"
      → full?       WAITLISTED → RSVP_WAITLISTED → alert: "you're #3"
  → a confirmed player cancels
      → RSVP_CANCELLED, and the longest-waiting player is promoted under the same row lock
      → RSVP_PROMOTED → alert: "a spot opened and it's yours"
  → organizer cancels the session
      → DROP_IN_CANCELLED → alert fans out to every player
```

## 3. Architecture

```
Next.js frontend
     ↓ REST/JSON
API Gateway (Spring Cloud Gateway, 8080)
     ↓ REST
user · court · dropin · search · notification
     ↕ gRPC (dropin → court)
     ↓ Kafka (dropin-events)
search-service (Elasticsearch)   notification-service (alert feed)
```

Six services, all **Java 21 + Spring Boot 4.0.x + Maven**, plus the Next.js frontend.
Infra: hosted Supabase Postgres, local Kafka (KRaft), Redis, Elasticsearch — all under
one `docker compose up`.

| Service              | Port        | Owns                          | Talks                                    |
| -------------------- | ----------- | ----------------------------- | ---------------------------------------- |
| api-gateway          | 8080        | routing only                  | REST → every service                     |
| user-service         | 8081        | `users` schema                | REST                                     |
| court-service        | 8082 + 9090 | `courts` schema               | REST + **gRPC server**                   |
| dropin-service       | 8083        | `dropins` schema              | REST, **gRPC client**, Kafka **producer** |
| notification-service | 8086        | `notifications` schema        | REST, Kafka **consumer**, Redis          |
| search-service       | 8087        | Elasticsearch `drop-ins` index | REST, Kafka **consumer**, Redis          |

## 4. Design rules

These are load-bearing. Breaking one is a defect, not a style choice.

- **Each service owns its data.** Never query another service's schema — call its API.
  Cross-service ids (`court_id`, `user_id`, `organizer_user_id`) are bare UUIDs with no
  foreign key.
- **Build in vertical slices**, never whole-backend-then-whole-frontend.
- **Kafka is "something happened, others may react"** — never request/response. If you
  need an answer, that's gRPC.
- **Every service exposes** `GET /health` → `{"service":"<name>","status":"UP"}`.
- **Flyway owns every schema**; Hibernate runs `ddl-auto: validate` and never alters.
  Never edit an applied migration — add the next `V<n>__`.
- **Each service validates the Supabase JWT itself** (OAuth2 resource server). The
  gateway routes; it does not authenticate on anyone's behalf.
- **Consumers must be idempotent** — Kafka delivery is at-least-once.

## 5. Inter-service communication

Three channels, never conflated:

| Direction              | Channel        | Why                                                     |
| ---------------------- | -------------- | ------------------------------------------------------- |
| Browser → backend      | **REST/JSON**  | gRPC isn't browser-native, so the edge stays REST        |
| Service → service sync | **gRPC**       | request/response with a typed contract                   |
| Service → service async| **Kafka**      | "X happened", fire-and-forget, many independent reactors |

**gRPC reference implementation:** dropin-service calls court-service's
`CourtService.GetCourt` to validate a court exists before creating a drop-in, and reuses
the same response to denormalize the court's location and surface onto the drop-in.
Court owns the data, so court is the server. Contract lives in `shared/proto/court.proto`
— a *contract*, not shared compiled code: each service runs `protoc` and gets its own stubs.

**Kafka contract:** `shared/event-contracts/events.md` is the single source of truth for
payload shapes. Messages are keyed by `dropInId`, so all events for one drop-in land on
one partition and stay ordered.

## 6. Data model

### `courts` (court-service)
`courts` — id, name, address, city, province, latitude, longitude, surface, owner.

### `dropins` (dropin-service)
- `drop_ins` — the aggregate root. Court/organizer ids, time window, `max_players`, price,
  skill level, denormalized court `latitude`/`longitude`/`city`, status (`OPEN`/`FULL`/
  `CANCELLED`), and a **denormalized `confirmed_players` counter** maintained under the
  row lock. The counter is what lets the `dropin` package avoid ever reading the `rsvp`
  package (no dependency cycle) and lets list views show "spots left" without a `COUNT(*)`.
- `drop_in_players` — one row per RSVP. `UNIQUE (drop_in_id, user_id)`, so a re-RSVP after
  a cancellation *reuses* the row. Status `CONFIRMED` / `WAITLISTED` / `CANCELLED`, plus
  `waitlisted_at` — the FIFO queue key, non-null iff WAITLISTED (a DB CHECK enforces the
  "iff"). Display position is derived by counting earlier entries, so nothing is
  renumbered on promotion.

### `notifications` (notification-service)
`alerts` — one row per alert shown to one user. Written **only** by the Kafka consumer,
never by a client. `UNIQUE (user_id, drop_in_id, event_key)` is what makes redelivery a
no-op instead of a duplicate.

### Elasticsearch (search-service)
`drop-ins` index — a projection of `DROP_IN_CREATED`, carrying a `geo_point` plus the card
fields, so a search result never needs a call back to dropin-service.

## 7. Concurrency: the RSVP path

The one genuinely hard piece. `RsvpService` runs the whole thing in one `@Transactional`
unit around a **pessimistic row lock** on the drop-in (`SELECT … FOR UPDATE` via
`DropInRepository.findByIdForUpdate`):

- Two players racing for the last spot serialize — one confirms, the other waitlists.
- The freed spot from a cancellation is handed to the waitlist head **inside the same
  lock**, so a fresh RSVP can't jump the queue.
- The capacity invariant lives on the `DropIn` entity (`reserveSpot`/`releaseSpot`/
  `hasSpotsLeft`), not in the service, and is backed by a DB CHECK as defence in depth.

Known limitation, deliberately accepted: publishing to Kafka inside the DB transaction is
a **dual write**. A crash between commit and send can drift the two. The production fix is
the transactional outbox pattern; this project publishes inline and documents it.

## 8. Redis

Two real uses, both read-caches on a hot path. Nothing else takes a Redis dependency
without a read to cache.

- **search-service** — the nearby-drop-ins geo query, 60s TTL. This is what makes repeat
  searches sub-second.
- **notification-service** — the unread-alert badge, read on every authenticated page
  load, evicted on every alert write and every mark-read.

## 9. Java package structure (all services)

**Feature-by-aggregate, layered within.** Reference impls: `court-service` (one aggregate),
`dropin-service` (two: `dropin` + `rsvp`).

```
com.courtsync.<svc>/
  <Svc>Application.java
  common/        service-wide infra (HealthController, GlobalExceptionHandler, JwtPrincipal)
  config/        SecurityConfig, CacheConfig
  event/         Kafka publishers + payload records (shared leaf; depends on nothing)
  <feature>/     ONE package per AGGREGATE
    domain/      @Entity + enums; business invariants live ON the entity
    repository/  Spring Data interfaces
    service/     @Service business logic; thin
    controller/  @RestController; HTTP plumbing only
    consumer/    @KafkaListener (consumer-side services)
    dto/         request/response records (never expose entities on the wire)
    exception/   custom exceptions (@ResponseStatus → HTTP code)
```

Dependencies between feature packages must be **acyclic and one-way**: `rsvp → dropin` is
allowed, `dropin → rsvp` is not. Verify with
`grep -rn "import ...<other-feature>" <feature>/`.

## 10. Error handling

Every REST error is an **RFC 9457 ProblemDetail** (`application/problem+json`) produced by
`common/GlobalExceptionHandler` — the same class body in every service, copied by
convention, never a shared jar. Domain exceptions carry `@ResponseStatus`; the advice reads
it generically, so **a new exception needs zero handler changes**. Validation failures carry
a `properties.errors` map. Unexpected exceptions return a generic 500 that never leaks
internals. The frontend reads `detail` from the body.

## 11. Frontend

Next.js (App Router, RSC) + TypeScript + Tailwind + **shadcn/ui** + pnpm, port 3000.
Auth is Supabase; the access token is attached to every backend call by `lib/api.ts`.

**Hard rule: use shadcn/ui components.** Never hand-roll UI the registry provides — see
`services/frontend/AGENTS.md` for the full rule and the escape hatch.

Routes: `/` marketing · `/login` `/signup` · `/home` · `/find` (map + geo-search) ·
`/drop-ins` `/drop-ins/[id]` `/drop-ins/create` `/drop-ins/[id]/edit` · `/courts/create` ·
`/my-drop-ins` (joined / waitlisted / hosting) · `/profile`. The alert bell lives in the
site header on every authenticated route.

## 12. Gateway routes

`StripPrefix=1` drops the leading `/api`, so `/api/drop-ins/{id}/rsvp` reaches
dropin-service as `/drop-ins/{id}/rsvp`.

| Path            | Service              |
| --------------- | -------------------- |
| `/api/users/**` | user-service         |
| `/api/courts/**`| court-service        |
| `/api/drop-ins/**` | dropin-service    |
| `/api/search/**`| search-service       |
| `/api/alerts/**`| notification-service |

## 13. Running it

```bash
# set SUPABASE_DB_PASSWORD in .env first
docker compose up --build          # everything
docker compose up kafka redis elasticsearch   # infra only
```

Per-service: `./mvnw test` (Java), `pnpm dev` / `pnpm build` / `pnpm lint` (frontend).

## 14. Deliberately deferred

Named so they don't get rediscovered as "missing":

- **Transactional outbox** for the Kafka dual-write in the RSVP path (§7).
- **Protobuf for Kafka payloads** — would touch both consumers, frontend types, and likely
  a schema registry. Its own phase.
- **Waitlist expiry** — a promoted player currently keeps the spot indefinitely rather than
  having a window to accept.
