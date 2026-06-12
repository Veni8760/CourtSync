# CourtSync — Working Status

_Last updated: 2026-06-10_

Source of truth for the whole build: **`MASTER.md`** at repo root. This file is just the
per-session handoff (done / unfinished / next).

CourtSync pivoted from the old Spring-Modulith monolith design to a **polyglot
microservices** skeleton (Java Spring Boot services + one Go notification worker, Kafka,
Redis, hosted Supabase Postgres, Next.js frontend, all orchestrated locally via Docker
Compose). The old `volleyiq_mvp_design_document.md` and the previous CLAUDE.md content are
historical.

---

## The big plan (from MASTER.md §27 build order)

Grouped into phases. We do them in order; each phase should leave the repo runnable.

### Phase 0 — Foundation & infra
- [x] Rewrite root `CLAUDE.md` → point at MASTER.md, correct microservices/Maven/hosted-Supabase stack
- [x] Convert `notification-service` from Java scaffold → **Go** module (`cmd/` + `internal/`) with `GET /health` (compiles)
- [x] Add `GET /health` → `{"service","status":"UP"}` to all 7 Java services (gateway uses reactive Mono)
- [x] spring-kafka already present on all Java service poms — no change needed
- [x] `application.yaml` per service: distinct ports + datasource (JPA services) via `${VAR:default}`
- [x] Dockerfile for every backend service (multi-stage) + frontend (Next standalone) + Go (distroless)
- [x] `docker-compose.yml`: hosted Supabase Postgres, local Kafka (KRaft), Redis, 8 services, frontend; infra healthchecks + depends_on
- [x] `.env.example` (MASTER §14) + hosted Supabase per-service schemas
- [x] `shared/event-contracts/events.md`
- [x] `docker compose config` validates (COMPOSE_OK)
- [x] **Verified before hosted-DB reroute: local-stack `docker compose up` booted; all 8 `/health` (8080–8087) returned UP, frontend 200 (2026-06-09)**
- [x] Hosted Supabase routing configured and committed (`7a366b6`): DB-backed services now use `SUPABASE_JDBC_BASE_URL`, `SUPABASE_DB_USER`, and `SUPABASE_DB_PASSWORD`
- [x] Added `scripts/supabase-psql.sh` helper for development DB inspection via `psql`
- [x] Supabase MCP verified schemas `users`, `courts`, `dropins`, `messages`, `payments`; `courts.courts` exists with 5 seed courts

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

### Phase 2 — Drop-in service + RSVP + Kafka (MASTER steps 8–12)  ← IN PROGRESS
Decisions (2026-06-10): RSVP concurrency = **pessimistic row lock** (SELECT FOR UPDATE on
drop_in) + `UNIQUE(drop_in_id,user_id)`; build the **whole vertical slice** this session.

Code organization (done 2026-06-10): adopted **feature-by-aggregate + layered** package
structure as the standard for ALL Java services (documented in CLAUDE.md "Java package
structure"). dropin-service split into `dropin/` + `rsvp/` siblings with one-way acyclic deps
(`rsvp → dropin`, never reverse); court-service retrofitted to match. Verified no cycle via
grep; both compile. Key enabling decision: `drop_ins.confirmed_players` denormalized counter
(maintained under the row lock) so `dropin/` never queries `rsvp/` to count players.

Backend (dropin-service, port 8083) — DONE, compiles clean:
- [x] `V1__create_dropins.sql`: drop_ins (+ confirmed_players counter) + drop_in_players (CHECKs, UNIQUE, FK)
- [x] Enums: `DropInStatus` (dropin/domain), `RsvpStatus` + `PaymentStatus` (rsvp/domain)
- [x] Entities: `DropIn` (rich domain: reserveSpot/releaseSpot), `DropInPlayer` (@ManyToOne LAZY)
- [x] Repos: `DropInRepository` (`@Lock(PESSIMISTIC_WRITE) findByIdForUpdate`), `DropInPlayerRepository`
- [x] DTOs: CreateDropInRequest, DropInResponse (reads counter), CreateRsvpRequest, RsvpResponse
- [x] Exceptions: DropInNotFound (404), DropInFull (409, dropin/), DuplicateRsvp (409, rsvp/)
- [x] `event/`: DropinEventPublisher (KafkaTemplate<String,String> + ObjectMapper, key=dropInId) + DropinEvents
- [x] `DropInService`: create/list/get + lockForUpdate seam; `RsvpService`: rsvp/cancel (dirty-checking)
- [x] Controllers: DropInController (POST/GET/GET), RsvpController (POST/DELETE rsvp)
- [x] Compiles (`./mvnw compile` EXIT 0)

Lombok & logging conventions (done 2026-06-10): adopted `@RequiredArgsConstructor` for all
constructor injection, `@Slf4j` for SLF4J logging (parameterized, business-event-only), entities
stay `@Getter/@Setter` (never `@Data`). Documented in CLAUDE.md. Applied across court + dropin
+ search; all compile.

Kafka consumers:
- [x] Go notification-service consumes `RSVP_CREATED`/`RSVP_CANCELLED` and logs it (already wired)
- [x] search-service `@KafkaListener` on `dropin-events` (JsonNode switch on eventType; consumer
      deserializers + auto-offset-reset=earliest); compiles

Gateway:
- [x] api-gateway route `/api/drop-ins,/api/drop-ins/**` → dropin-service (StripPrefix=1);
      `DROPIN_SERVICE_URL` already wired in docker-compose

gRPC + Protobuf (service-to-service) — DONE 2026-06-10, both compile clean:
Decision: solve cross-service typing with **Protobuf** + use **gRPC** for synchronous
service-to-service calls now (REST stays at the browser edge; Kafka stays for async events).
First real seam introduced (there were zero sync calls before — services were all Kafka-decoupled):
**dropin-service validates the court exists via gRPC before creating a drop-in** (was an unvalidated
bare `court_id`). court owns court data → court = gRPC server, dropin = client. Strategy recorded
in CLAUDE.md "Inter-service communication & contracts".
- [x] `shared/proto/court.proto` — single contract (`CourtService.GetCourt`), both services gen stubs from it
- [x] Both poms: Spring gRPC BOM (`spring-grpc-dependencies:1.0.3`) + starter +
      `protobuf-maven-plugin` (sourceDirectories → `../../shared/proto`); pinned protoc 4.28.2 / grpc-java 1.69.0
- [x] court-service: `CourtGrpcService` (extends generated base, reuses `CourtService.findById`,
      maps `CourtNotFoundException`→`Status.NOT_FOUND`); gRPC server on `COURT_GRPC_PORT:9090`
- [x] dropin-service: `CourtGrpcClientConfig` (channel+stub bean) + `CourtClient.courtExists` +
      new `CourtNotFoundException` (400); call wired into `DropInService.create`; named channel in yaml
- [x] docker-compose: court publishes 9090; dropin gets `COURT_GRPC_ADDRESS=static://court-service:9090`
- [x] Verified: both `./mvnw compile` BUILD SUCCESS, stubs generated in both, `docker compose config` OK
- [ ] (Deferred to E2E) runtime round-trip: bogus court_id → 400, real seeded court → 201 + court logs GetCourt
- [ ] (Deferred, separate phase) migrate Kafka event payloads to Protobuf (touches Go + search + TS)

Frontend (NEXT — not started; mind the recent-Next.js gotcha, check node_modules docs):
- [ ] `lib/dropins.ts` data layer (list/get/create/rsvp) mirroring `lib/courts.ts`
- [ ] `/drop-ins` list, `/drop-ins/[id]` detail + RSVP button, `/drop-ins/create`
- [ ] Verify: compile, lint, prod build, end-to-end create→view→RSVP→Kafka→consumed in logs
- [ ] (Deferred) runtime boot against hosted Supabase still unverified — do during E2E check

### Phase 3 — Polish skeleton
- [ ] User service CRUD, messaging/payment placeholders, error handling, validation, logging

### Later (NOT in skeleton): auth, Redis locking, WebSocket chat, Resend email, Stripe, Elasticsearch, k8s, Rust analytics.

---

## What we did this session
- Created and worked on branch `feature/dropin-rsvp-kafka`.
- Installed and authenticated the Supabase MCP server; installed Supabase Agent Skills locally and ignored those local skill files.
- Set the app architecture to use one hosted Supabase Postgres database with one schema per DB-backed service.
- Created/verified hosted Supabase service schemas: `users`, `courts`, `dropins`, `messages`, `payments`.
- Created and seeded `courts.courts` in hosted Supabase with 5 development courts.
- Rerouted DB-backed Spring services in Docker Compose to hosted Supabase using `SUPABASE_JDBC_BASE_URL`, `SUPABASE_DB_USER`, and `SUPABASE_DB_PASSWORD`.
- Added `baseline-on-migrate: true` for `court-service` so Flyway can adopt the already-seeded hosted `courts` schema.
- Added `scripts/supabase-psql.sh` so development `psql` access is a short command instead of a full connection string.
- Updated `README.md`, `MASTER.md`, `CLAUDE.md`, `.env.example`, and this handoff for hosted Supabase.
- Committed the hosted Supabase routing/helper work as `7a366b6 Route services to hosted Supabase`.

## What's unfinished / open questions
- Kafka image choice — using apache/kafka KRaft single-broker (no Zookeeper)
- Hosted Supabase DB password must be set in local `.env` as `SUPABASE_DB_PASSWORD`
- Runtime boot against hosted Supabase still needs verification. Static checks passed (`docker compose config --quiet`, `git diff --check`), but Docker startup was interrupted before containers were allowed to run.
- If the direct Supabase DB endpoint fails from local Docker because of IPv6/network support, switch `SUPABASE_JDBC_BASE_URL` to the Supabase Session Pooler URL and set `SUPABASE_DB_USER` to the pooler username (`postgres.<project-ref>`).
- `courts.courts` currently has RLS disabled. This is acceptable for backend-only JDBC service access during the skeleton, but must be revisited before exposing tables through Supabase Data API or client-side Supabase access.

## What's next (one finishable chunk)
- First verify the hosted Supabase court slice at runtime: `docker compose up --build kafka court-service api-gateway frontend`, then check `GET /health`, `GET /api/courts`, and `http://localhost:3000/courts`.
- After that passes, start Phase 2: implement drop-in tables/entity/repo/service/controller, then RSVP and Kafka events.
