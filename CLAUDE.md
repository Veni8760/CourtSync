# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

**`MASTER.md`** (repo root) is the canonical spec for the entire build — architecture,
services, Kafka events, DB tables, build order, milestones. Read it before doing anything.
Older docs (`volleyiq_mvp_design_document.md`, `docs/superpowers/specs/...`) are historical
brainstorming from a previous **abandoned** design (a Spring Modulith monolith on Supabase +
Stripe Connect). Do not follow them.

## Project

CourtSync: a full-stack volleyball drop-in platform (discover courts, create drop-in sessions,
RSVP, later chat/pay/search). This is a **learning project** for production-grade *polyglot
microservices* — favor depth, correctness, and idiomatic patterns over speed.

First goal is a clean microservices **skeleton** with one end-to-end flow:
create court → create drop-in → view → RSVP → publish `RSVP_CREATED` to Kafka → consumed +
logged by the Go notification-service and the search-service. See MASTER.md §20 for the
milestone definition.

## Architecture

Polyglot microservices behind an API gateway, async via Kafka, all run with Docker Compose:

```
Next.js frontend → API Gateway (Spring Cloud Gateway) → REST → domain services → Kafka (async)
```

Services (`services/`): `api-gateway`, `user-service`, `court-service`, `dropin-service`,
`messaging-service`, `payment-service`, `search-service` (all **Java Spring Boot**, Maven),
plus `notification-service` (**Go** — Kafka consumer + `/health`). `frontend/` is Next.js.
Infra: Postgres, Kafka (KRaft, no Zookeeper), Redis. Later: Elasticsearch, k8s, Rust analytics.

Key rules (from MASTER.md):
- Build in **vertical slices**, not whole-backend-then-whole-frontend.
- Each service owns its own data; never query another service's tables — call its API.
- Kafka is for "something happened, others may react" — **not** request/response. Reads/writes use REST.
- Every backend service exposes `GET /health` → `{"service":"<name>","status":"UP"}`.

## Stack

- **Frontend**: Next.js + TypeScript + Tailwind + shadcn/ui + TanStack Query. pnpm. Port 3000.
- **Java services**: Java 21 (toolchain Java 26 ok) + Spring Boot 3.5.x + **Maven** (`./mvnw`).
  Ports 8080–8087 (gateway 8080, user 8081, court 8082, dropin 8083, messaging 8084,
  payment 8085, notification 8086, search 8087).
- **Go service**: `notification-service` — `cmd/notification-service` + `internal/{config,health,kafka,handlers}`.
- **DB**: one Postgres database with one schema per DB-backed service, matching hosted Supabase.
- **Messaging**: Kafka topics per MASTER §9.1; the load-bearing one for the skeleton is `dropin-events`.

## Commands

### Whole stack
- `docker compose up` — bring up infra + all services (the milestone target)
- `docker compose up postgres kafka redis` — infra only

### A Java service (`cd services/<name>`)
- `./mvnw spring-boot:run` — run locally
- `./mvnw test` — run tests
- `./mvnw -q -DskipTests package` — build jar

### Go service (`cd services/notification-service`)
- `go run ./cmd/notification-service` — run locally
- `go test ./...` — tests

### Frontend (`cd services/frontend`)
- `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm lint`

## Frontend gotcha

This is a recent Next.js with breaking changes from earlier versions. Consult
`services/frontend/node_modules/next/dist/docs/` for the current API surface before writing
frontend code — training data may reflect Next 14/15 conventions that no longer apply.
React Compiler is enabled, so manual `useMemo`/`useCallback` are generally unnecessary.

## Workflow expectations (from user's global rules)

- Plan before non-trivial work; keep the plan in `tasks/todo.md` with checkable items.
- Mark items complete as you go; add a review section when done.
- After any user correction, append the lesson to `tasks/lessons.md`.
- End each session by updating `tasks/todo.md` (done / unfinished / one finishable next chunk).
- Never mark a task complete without proving it works (tests, logs, demonstrated behavior).
