# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

**`MASTER.md`** (repo root) is the canonical spec — scope, architecture, services, Kafka
events, DB schemas. Read it before doing anything. It describes **what is built**, not a
wishlist: if something isn't in MASTER.md, it isn't in scope. The historical brainstorming
docs (an abandoned Spring Modulith monolith on Supabase + Stripe Connect) have been deleted.

## Project

CourtSync: a full-stack volleyball drop-in platform — discover courts, create drop-in
sessions, RSVP, join a waitlist, get alerted, and geo-search nearby sessions. This is a
**learning project** for production-grade microservices — favor depth, correctness, and
idiomatic patterns over speed.

**Scope is fixed by the resume bullets** (MASTER.md §1). Anything outside them is bloat:
1. Next.js frontend + Spring Boot microservices over **gRPC** for court discovery,
   scheduling, and player flows.
2. Event-driven backend on **Kafka + Redis** for drop-ins, RSVPs, **waitlists**, and
   **player alerts**.
3. Sub-second geo-search for nearby drop-ins via **Elasticsearch** indexes over Postgres.

## Architecture

Microservices behind an API gateway, async via Kafka, all run with Docker Compose:

```
Next.js frontend → API Gateway (Spring Cloud Gateway) → REST → domain services → Kafka (async)
```

Six services (`services/`), all **Java Spring Boot + Maven** except the frontend:
`api-gateway`, `user-service`, `court-service`, `dropin-service`, `search-service`,
`notification-service`; `frontend/` is Next.js. Infra: hosted Supabase Postgres, local
Kafka (KRaft, no Zookeeper), Redis, Elasticsearch.

The two Kafka consumers are read-model services — each owns a projection built from
`dropin-events`, never a shared table: search-service projects into Elasticsearch,
notification-service into a per-user alert feed.

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
  pin `protoc`/`grpc-java` versions to match the `spring-grpc-dependencies` BOM (the imported
  gRPC BOM governs protobuf/grpc versions, overriding the Boot parent). **spring-grpc's version
  line dictates the Spring Boot major: 1.0.x ⇒ Boot 4.0.x** (its autoconfig references Boot-4
  internals; running it on Boot 3.5 fails at *runtime* with `NoClassDefFoundError`, not at build).
  Map domain exceptions to gRPC `Status` codes on the server, translate `StatusRuntimeException`
  back to domain meaning on the client. **Security gotcha:** once a gRPC-server service is also an
  OAuth2 resource server (`issuer-uri` set), spring-grpc's `GrpcSecurityAutoConfiguration` +
  gRPC `OAuth2ResourceServerAutoConfiguration` **auto-secure the gRPC port too** — internal
  service→service calls then fail with `UNAUTHENTICATED` (they carry no user JWT). The gRPC port
  is internal/trusted on the compose network, so exclude both via `spring.autoconfigure.exclude`
  (see court-service `application.yaml`); REST stays protected by the servlet `SecurityConfig`,
  a separate filter chain. (The old "the gRPC port isn't covered by the servlet chain" assumption
  was only half true — spring-grpc has its *own* security layer.)
- **Service → service, async ("X happened, others may react"): Kafka.** Still plain JSON strings
  per `shared/event-contracts/events.md` (search + notification consumers decode it, each in its
  own consumer group). Delivery is at-least-once, so a consumer must be idempotent —
  notification-service does this with a UNIQUE `event_key` per (user, drop-in). **Deferred:**
  migrating Kafka payloads to Protobuf (touches both consumers + frontend TS + likely a schema
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

### Error handling convention (apply to all Java services)

Every REST error is an **RFC 9457 ProblemDetail** (`application/problem+json`), produced by
`common/GlobalExceptionHandler` (`@RestControllerAdvice extends ResponseEntityExceptionHandler`)
— same class body in every service, copied by convention (never a shared jar). Rules:
- Domain exceptions keep `@ResponseStatus` + a constructor message; the advice reads the
  annotation generically (`AnnotatedElementUtils.findMergedAnnotation`), so **new exceptions
  need zero handler changes** — never add per-exception `@ExceptionHandler` methods.
- Validation failures (400) carry a `properties.errors` map of `field → message`.
- Unannotated/unexpected exceptions → 500 with generic detail only (**never leak internals**);
  log at `error` with stack trace. Domain errors log at `warn`.
- Frontend reads `detail` from error bodies (`getErrorMessage` in `src/lib/{dropins,courts}.ts`).

## Stack

- **Frontend**: Next.js + TypeScript + Tailwind + shadcn/ui + TanStack Query. pnpm. Port 3000.
- **Java services**: Java 21 (toolchain Java 26 ok) + Spring Boot 4.0.x (Spring Framework 7) +
  **Maven** (`./mvnw`). Ports: gateway 8080, user 8081, court 8082 (+ gRPC 9090), dropin 8083,
  notification 8086, search 8087. Boot-4 specifics that bit us
  during the 3.5→4.0 migration: autoconfig is modular, so Kafka needs
  `spring-boot-starter-kafka` (the raw `spring-kafka` artifact no longer triggers
  autoconfiguration); the default JSON mapper is **Jackson 3** (`tools.jackson.*`, unchecked
  exceptions) not Jackson 2 (`com.fasterxml.jackson.*`); Hibernate 7 validates column
  nullability strictly (entity `@Column(nullable=…)` must match the DB). api-gateway uses
  Spring Cloud **2025.1.x** (the Boot-4 train) with Spring Cloud Gateway 5.0.
- **DB**: hosted Supabase Postgres, one database with one schema per DB-backed service
  (`users`, `courts`, `dropins`, `notifications`). Flyway owns every schema; `ddl-auto: validate`.
- **Messaging**: Kafka topics per `shared/event-contracts/events.md`; the load-bearing one is
  `dropin-events` (drives both the search index and the alert feed).
- **Cache**: Redis — geo-search results in search-service, unread alert badge in
  notification-service. Nothing else should take a Redis dependency without a real read to cache.

## HARD RULE: never sign up fake email addresses

**Do not call Supabase `/auth/v1/signup` with an address that isn't a real inbox** — not
`@example.com`, not `something.test@gmail.com`, not any invented Gmail. This project uses
Supabase's *shared* SMTP, which has strict bounce limits: every fake signup sends a
confirmation email that hard-bounces, and enough bounces get the project's email sending
**restricted**. This already happened once (2026-08-14) and triggered a warning from Supabase.

To test an authenticated flow, in order of preference:

1. **Reuse an existing confirmed account.** `select email from auth.users where
   email_confirmed_at is not null;` — ask for the password rather than making a new user.
2. **Run the local Supabase stack** (`supabase start`). Mail goes to Inbucket; nothing
   leaves the machine.
3. **Turn off email confirmation** for the dev project (Dashboard → Authentication →
   Sign In / Providers → Email → *Confirm email* off), so signup issues a session and sends
   no mail at all.
4. **Custom SMTP** (Dashboard → Authentication → Emails → SMTP Settings) if real mail is
   genuinely needed — then bounces hit your own provider's reputation, not Supabase's shared pool.

If a test account does get created, delete it immediately:
`delete from auth.users where email = '<addr>';`

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

### Frontend (`cd services/frontend`)
- `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm lint`

## Frontend gotcha

This is a recent Next.js with breaking changes from earlier versions. Consult
`services/frontend/node_modules/next/dist/docs/` for the current API surface before writing
frontend code — training data may reflect Next 14/15 conventions that no longer apply.
React Compiler is enabled, so manual `useMemo`/`useCallback` are generally unnecessary.

## Frontend HARD RULE: use shadcn/ui components

**Never hand-roll UI that shadcn/ui already provides.** Check `src/components/ui/` first;
if the component isn't there, add it (`pnpm dlx shadcn@latest add <component>`) rather than
writing your own. A bare `<button>`, a hand-styled card `<div>`, a bespoke badge span, or a
hand-written empty state counts as a defect even when it renders correctly — it drifts from
the design tokens and drops the accessibility behaviour the primitives carry. Dropping to a
raw element is allowed only when no registry component covers the case, and needs a one-line
comment saying what was checked and why it didn't fit. Full rule: `services/frontend/AGENTS.md`.

## Workflow expectations (from user's global rules)

- Plan before non-trivial work; keep the plan in `tasks/todo.md` with checkable items.
- Mark items complete as you go; add a review section when done.
- After any user correction, append the lesson to `tasks/lessons.md`.
- End each session by updating `tasks/todo.md` (done / unfinished / one finishable next chunk).
- Never mark a task complete without proving it works (tests, logs, demonstrated behavior).
