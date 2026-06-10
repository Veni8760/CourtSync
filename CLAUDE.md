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
Infra: hosted Supabase Postgres, local Kafka (KRaft, no Zookeeper), Redis. Later: Elasticsearch, k8s, Rust analytics.

Key rules (from MASTER.md):
- Build in **vertical slices**, not whole-backend-then-whole-frontend.
- Each service owns its own data; never query another service's tables — call its API.
- Kafka is for "something happened, others may react" — **not** request/response.
- Every backend service exposes `GET /health` → `{"service":"<name>","status":"UP"}`.

### Inter-service communication & contracts

Three distinct channels — don't conflate them:
- **Browser → backend: REST/JSON** through the API gateway. gRPC isn't browser-native, so the
  edge stays REST. This is the *only* place REST is used cross-process.
- **Service → service, synchronous (request/response): gRPC.** Defined by a `.proto` in
  `shared/proto/` (single source of truth — a *contract*, not shared compiled code; each service
  runs `protoc` and gets its own generated stubs). Reference impl: `dropin-service` calls
  `court-service`'s `CourtService.GetCourt` to validate a court exists before creating a drop-in
  (court owns the data → court is the gRPC server, dropin the client). gRPC runs on its own
  HTTP/2 port (court: 9090) alongside REST (8082). Tooling: official **Spring gRPC**
  (`org.springframework.grpc`, BOM `spring-grpc-dependencies`) + `io.github.ascopes:protobuf-maven-plugin`;
  pin `protoc`/`grpc-java` versions (Boot 3.5.x's protobuf-java is 3.x — incompatible with grpc-java 1.69's protobuf 4.x).
  Map domain exceptions to gRPC `Status` codes on the server, translate `StatusRuntimeException`
  back to domain meaning on the client.
- **Service → service, async ("X happened, others may react"): Kafka.** Still plain JSON strings
  per `shared/event-contracts/events.md` (the Go + search consumers decode it). **Deferred:**
  migrating Kafka payloads to Protobuf (touches Go + search + frontend TS + likely a schema
  registry) — a separate phase, not done yet.

## Java package structure (standard for ALL Java services)

**Feature-by-aggregate, layered within.** Top-level packages are *features* (one per DDD
aggregate), and each feature is split by *layer* underneath. Reference implementations:
`court-service` (one aggregate) and `dropin-service` (two: `dropin` + `rsvp`).

```
com.courtsync.<svc>/
  <Svc>Application.java
  common/        service-wide infra not tied to a feature (HealthController, later GlobalExceptionHandler)
  event/         Kafka publishers + event payload records (shared leaf; depends on nothing)
  <feature>/     ONE package per AGGREGATE (e.g. dropin/, rsvp/, court/)
    domain/      @Entity classes + enums. Put business invariants ON the entity (rich domain
                 model), e.g. DropIn.reserveSpot()/releaseSpot() — not in the service.
    repository/  Spring Data interfaces
    service/     @Service business logic; thin
    controller/  @RestController; HTTP plumbing only
    dto/         request/response records (never expose entities on the wire)
    exception/   custom exceptions (@ResponseStatus → HTTP code)
```

Rules that keep this scalable:
- **One feature package = one aggregate**, NOT one operation. RSVP lives *inside* `dropin/`'s
  sibling `rsvp/` only because DropInPlayer is its own aggregate-ish concern; capacity rules
  stay on the `DropIn` root. When in doubt, fewer feature packages.
- **Dependencies between feature packages must be acyclic and one-way.** `rsvp → dropin` is
  allowed; `dropin → rsvp` is NOT. To avoid a cycle, `drop_ins` carries a denormalized
  `confirmed_players` counter (maintained under the row lock) so `dropin/` never has to query
  `rsvp/` for a count. Verify with: `grep -rn "import ...<other-feature>" <feature>/`.
- A second aggregate in a service = a new sibling feature package with the same internal layers.

### Lombok & logging conventions (apply to all Java code)

- **Constructor injection via `@RequiredArgsConstructor`.** Make injected deps `private final`
  and let Lombok generate the constructor — do NOT hand-write `public XService(...) {}`.
- **Entities: `@Getter @Setter` ONLY.** Never `@Data`/`@EqualsAndHashCode`/`@ToString` on an
  `@Entity` — they generate equals/hashCode/toString over all fields, which triggers lazy
  loading, breaks JPA identity, and can `StackOverflowError` on relationships. Records (DTOs,
  events) need no Lombok.
- **Logging via `@Slf4j`** (SLF4J). Use `{}` placeholders, never string concatenation:
  `log.info("RSVP confirmed: dropIn={} user={}", dropInId, userId)`.
- **Log only meaningful events**, not boilerplate: business state changes (created / confirmed
  / cancelled) at `info`; event publish/consume at `info` (consumers) or `debug` (producers);
  recoverable problems at `warn`. No logging in getters, DTOs, or on every method entry.

## Stack

- **Frontend**: Next.js + TypeScript + Tailwind + shadcn/ui + TanStack Query. pnpm. Port 3000.
- **Java services**: Java 21 (toolchain Java 26 ok) + Spring Boot 3.5.x + **Maven** (`./mvnw`).
  Ports 8080–8087 (gateway 8080, user 8081, court 8082, dropin 8083, messaging 8084,
  payment 8085, notification 8086, search 8087).
- **Go service**: `notification-service` — `cmd/notification-service` + `internal/{config,health,kafka,handlers}`.
- **DB**: hosted Supabase Postgres, one database with one schema per DB-backed service.
- **Messaging**: Kafka topics per MASTER §9.1; the load-bearing one for the skeleton is `dropin-events`.

## Commands

### Whole stack
- Set `SUPABASE_DB_PASSWORD` in `.env` before starting DB-backed services.
- `docker compose up` — bring up local Kafka/Redis + all services against hosted Supabase
- `docker compose up kafka redis` — local infra only; Supabase is hosted
- `docker compose --profile local-db up postgres` — optional local Postgres fallback only

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
