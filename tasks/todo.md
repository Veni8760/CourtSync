# CourtSync — Working Status

_Last updated: 2026-06-09_

Source of truth for the whole build: **`MASTER.md`** at repo root. This file is just the
per-session handoff (done / unfinished / next).

CourtSync pivoted from the old Spring-Modulith monolith design to a **polyglot
microservices** skeleton (Java Spring Boot services + one Go notification worker, Kafka,
Redis, Postgres, Next.js frontend, all via Docker Compose). The old `volleyiq_mvp_design_document.md`
and the previous CLAUDE.md content are historical.

---

## The big plan (from MASTER.md §27 build order)

Grouped into phases. We do them in order; each phase should leave the repo runnable.

### Phase 0 — Foundation & infra
- [x] Rewrite root `CLAUDE.md` → point at MASTER.md, correct microservices/Maven/local-Postgres stack
- [x] Convert `notification-service` from Java scaffold → **Go** module (`cmd/` + `internal/`) with `GET /health` (compiles)
- [x] Add `GET /health` → `{"service","status":"UP"}` to all 7 Java services (gateway uses reactive Mono)
- [x] spring-kafka already present on all Java service poms — no change needed
- [x] `application.yaml` per service: distinct ports + datasource (JPA services) via `${VAR:default}`
- [x] Dockerfile for every backend service (multi-stage) + frontend (Next standalone) + Go (distroless)
- [x] `docker-compose.yml`: postgres, kafka (KRaft), redis, 8 services, frontend; infra healthchecks + depends_on
- [x] `.env.example` (MASTER §14) + `infra/postgres/init.sql` (per-service schemas)
- [x] `shared/event-contracts/events.md`
- [x] `docker compose config` validates (COMPOSE_OK)
- [x] **Verified: `docker compose up` boots; all 8 `/health` (8080–8087) return UP, frontend 200 (2026-06-09)**

### Phase 1 — Court service (vertical, MASTER step 7)  ← DONE
Backend (court-service, port 8082) — schema via **Flyway** (chosen 2026-06-09):
- [x] Add Flyway deps to pom (flyway-core + flyway-database-postgresql)
- [x] `application.yaml`: ddl-auto update → **validate** (Flyway owns schema)
- [x] `V1__create_courts_table.sql` migration (`surface` + `net_height` refinement over MASTER §8.3)
- [x] `Surface` enum (INDOOR/GRASS/BEACH) + `NetHeight` enum (MENS/WOMENS/COED)
- [x] `Court` entity (@Entity → courts table)
- [x] `CourtRepository` (Spring Data JPA)
- [x] DTOs: `CreateCourtRequest` (validated) + `CourtResponse`
- [x] `CourtService` (business logic) + `CourtNotFoundException` (404)
- [x] `CourtController`: POST /courts, GET /courts, GET /courts/{id}
- [x] Compiles locally (mvnw compile EXIT 0)
- [x] Verify (USER): rebuild court-service, curl create + list + get
- [x] API Gateway route `/api/courts/**` (StripPrefix=1 → court-service `/courts`)
- [x] Frontend: courts list page (`/courts`) + create court form (`/courts/create`)
- [x] Verified: api-gateway tests, frontend lint, frontend production build (2026-06-09)

### Phase 2 — Drop-in service + RSVP + Kafka (MASTER steps 8–12)
- [ ] Drop-in + drop_in_players tables, entity/repo/service/controller
- [ ] RSVP endpoint: prevent duplicate, prevent when full
- [ ] Publish `RSVP_CREATED` / `RSVP_CANCELLED` to `dropin-events`
- [ ] Go notification-service consumes `RSVP_CREATED` and logs it
- [ ] Search service consumes `RSVP_CREATED` and logs it
- [ ] Frontend: drop-in list, detail page, RSVP button

### Phase 3 — Polish skeleton
- [ ] User service CRUD, messaging/payment placeholders, error handling, validation, logging

### Later (NOT in skeleton): auth, Redis locking, WebSocket chat, Resend email, Stripe, Elasticsearch, k8s, Rust analytics.

---

## What we did this session
- Completed Phase 1 court vertical after the user verified court-service create/list/get.
- Added API Gateway `/api/courts/**` route.
- Added real-data frontend court list and create form, with Next server actions posting through the gateway.
- Added `COURTSYNC_API_BASE_URL` for server-side Next calls inside Docker Compose.

## What's unfinished / open questions
- Kafka image choice — using apache/kafka KRaft single-broker (no Zookeeper)
- Local DB/Supabase shape: one Postgres database with one schema per DB-backed service

## What's next (one finishable chunk)
- Start Phase 2: implement drop-in tables/entity/repo/service/controller, then RSVP and Kafka events.
