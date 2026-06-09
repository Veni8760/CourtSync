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

### Phase 0 — Foundation & infra (THIS SESSION)
- [x] Rewrite root `CLAUDE.md` → point at MASTER.md, correct microservices/Maven/local-Postgres stack
- [x] Convert `notification-service` from Java scaffold → **Go** module (`cmd/` + `internal/`) with `GET /health` (compiles)
- [x] Add `GET /health` → `{"service","status":"UP"}` to all 7 Java services (gateway uses reactive Mono)
- [x] spring-kafka already present on all Java service poms — no change needed
- [x] `application.yaml` per service: distinct ports + datasource (JPA services) via `${VAR:default}`
- [x] Dockerfile for every backend service (multi-stage) + frontend (Next standalone) + Go (distroless)
- [x] `docker-compose.yml`: postgres, kafka (KRaft), redis, 8 services, frontend; infra healthchecks + depends_on
- [x] `.env.example` (MASTER §14) + `infra/postgres/init.sql` (per-service DBs)
- [x] `shared/event-contracts/events.md`
- [x] `docker compose config` validates (COMPOSE_OK)
- [ ] **Verify (USER runs): `docker compose up --build` boots; every `/health` returns UP** ← next

### Phase 1 — Court service (vertical, MASTER step 7)
- [ ] Court entity / repo / service / controller, Flyway migration for `courts`
- [ ] API Gateway route `/api/courts/**`
- [ ] Frontend: courts list + create court form

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
- Built out all of Phase 0 except the final `docker compose up` boot check (see above).
- Decisions: notification-service = Go; full-Docker run strategy (per MASTER); kept custom `/health`
  controllers (MASTER contract) instead of actuator-only; one Postgres container, 5 DBs via init.sql.

## What's unfinished / open questions
- Kafka image choice — using apache/kafka KRaft single-broker (no Zookeeper)
- Local DB: one Postgres container, one database per service via init script (MASTER §7 allows shared for local)

## What's next (one finishable chunk)
- Finish Phase 0 and confirm `docker compose up` brings every service to a healthy `/health`.
