# CourtSync — Working Status

_Last updated: 2026-06-12_

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

### Phase 2 — Drop-in service + RSVP + Kafka (MASTER steps 8–12)  ← DONE (in PR #2)
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
- [x] **Runtime round-trip verified live (2026-06-10):** bogus court_id → 400, real court → 201 + court logs `gRPC GetCourt served`. Required the Boot 4 migration below to even boot.
- [ ] (Deferred, separate phase) migrate Kafka event payloads to Protobuf (touches Go + search + TS)

Spring Boot 3.5 → 4.0 migration (DONE 2026-06-10, committed `55a3aad`) — forced because
spring-grpc 1.0.x only runs on Boot 4.0.x (runtime `NoClassDefFoundError`, not a build error):
- [x] All 7 Java service poms → `spring-boot-starter-parent` 4.0.2; api-gateway `spring-cloud` 2025.1.1 (SCG 5.0)
- [x] Kafka: raw `spring-kafka` → `spring-boot-starter-kafka` (Boot 4 modular autoconfig)
- [x] Jackson: dropin publisher + search consumer → Jackson 3 (`tools.jackson.*`, unchecked exceptions)
- [x] Hibernate 7: `DropIn`/`DropInPlayer` created_at/updated_at marked `nullable=false` (strict validation)
- [x] Docker: court/dropin build context → repo root so Dockerfile can COPY `shared/proto`
- [x] Supabase from Docker: switched to IPv4 **Session Pooler** (`aws-1-us-west-2.pooler.supabase.com:5432`, user `postgres.<ref>`)

Frontend (DONE 2026-06-11, built via subagent-driven-development, all shadcn registry components):
- [x] `lib/dropins.ts` data layer (list/get/create/rsvp/cancel) + `getCourt` in `lib/courts.ts`
- [x] `lib/dev-identity.ts` — stable per-browser dev UUID (`useSyncExternalStore`), stands in for auth
- [x] `/drop-ins` list, `/drop-ins/create` (server action + Zod), `/drop-ins/[id]` detail + RSVP/cancel (server actions, revalidatePath), loading + not-found
- [x] Deleted abandoned VolleyIQ mock cruft (signup-form, session-card, signup/success routes)
- [x] Verified: `pnpm lint` + `pnpm build` green; live route smoke tests pass
- [x] Final holistic review: fixed site-header Host link `/drop-ins/new`→`/drop-ins/create`, cancel-RSVP 404 copy, loading copy
- [x] Runtime boot against hosted Supabase verified (full stack up; see below)

### Phase 3 — Polish skeleton
- [x] **user-service vertical (DONE 2026-06-12, branch `feature/user-service-vertical`):**
  `V1__create_users_table.sql` (timestamptz + skill_level CHECK per hardened DBML),
  `com.courtsync.users.user/*` feature package mirroring court-service, duplicate-email →
  409 (existsByEmail pre-check + DB UNIQUE backstop), gateway `/api/users/**` route,
  HealthController → `common/`. Verified live through gateway: 201/200/409/404/400.
- [x] **fix(flyway): Boot 4 needs `spring-boot-starter-flyway`** — raw flyway-core silently
  stopped running migrations after the 3.5→4.0 migration; swapped in all 5 DB-backed poms;
  court+dropin rebuilt and re-validated their existing schema history clean.
- [x] **GlobalExceptionHandler (DONE 2026-06-12, branch `feature/global-exception-handler`):**
  RFC 9457 ProblemDetail (`application/problem+json`) across court+dropin+user via
  `common/GlobalExceptionHandler extends ResponseEntityExceptionHandler`. Generic
  `@ResponseStatus`-reading handler (new exceptions need zero handler changes), validation
  400s carry `errors:{field→msg}`, 500s never leak internals. Frontend `getErrorMessage`
  reads `detail`. Convention documented in CLAUDE.md. Curl-verified every error path incl.
  gRPC-translated court-not-found and duplicate RSVP; happy paths unchanged.
- [ ] messaging/payment placeholders, remaining cross-cutting polish

### Later (NOT in skeleton): auth, Redis locking, WebSocket chat, Resend email, Stripe, Elasticsearch, k8s, Rust analytics.

---

## What we did this session (2026-06-12)
- **Normalized the DBML schema** (`docs/schema/courtsync.dbml`): 3NF pass with documented
  intentional denormalizations, CHECKs for every invariant, partial uniques (re-book after
  cancel, one live reservation/payment per ref), deferrable waitlist position unique,
  single-source-of-truth waitlist (dropped WAITLISTED from bookings.status), currency on
  drop_ins.price, ISO-4217 everywhere.
- **Built the Phase 3 user-service vertical** (branch `feature/user-service-vertical`,
  3 commits): Flyway V1 (timestamptz convention), full feature package, 409-on-duplicate-email,
  gateway route. Verified live: 201/200/409/404/400 through the gateway.
- **Found + fixed a silent Boot 4 regression**: Flyway hadn't been running since the 3.5→4.0
  migration (`flyway-core` doesn't autoconfigure on Boot 4 — needs `spring-boot-starter-flyway`).
  Swapped in all 5 DB-backed poms; rebuilt court+dropin to confirm clean history validation.
- **Merged PR #3** (user vertical + Flyway fix + schema docs), then built the
  **GlobalExceptionHandler chunk**: RFC 9457 ProblemDetail everywhere, annotation-driven
  generic handler, field-level validation errors, leak-proof 500s, frontend `detail` parsing,
  CLAUDE.md convention. Verified live: 7 error paths + happy paths through the gateway.

## Previous session (2026-06-11)
- Built the **Phase 2 drop-in frontend vertical** via subagent-driven-development (8 tasks + two-stage review each), all UI from shadcn registry components (no hand-written primitives). Locked decisions: real-but-simpler pages (replacing the abandoned VolleyIQ mock) + stable per-browser dev identity.
- Files: `lib/dropins.ts`, `getCourt` in `lib/courts.ts`, `lib/dev-identity.ts` (`useSyncExternalStore`), components (drop-in card, create form, rsvp panel, dev-player badge), routes (list, create, detail, loading, not-found) with server actions for create/rsvp/cancel. Deleted mock signup/checkout cruft.
- Final holistic review caught + fixed a blocker (site-header "Host" linked to deleted `/drop-ins/new` → `/drop-ins/create`) plus 2 minor copy fixes. `pnpm lint` + `pnpm build` green; live smoke tests pass.
- **Opened PR #2** (`feature/dropin-rsvp-kafka` → `main`): https://github.com/Veni8760/CourtSync/pull/2 — bundles dropin+RSVP (gRPC+Kafka), the Boot 4 migration, and the frontend. 14 commits, 97 files.
- Stripped the `Co-Authored-By: Claude` trailer from 6 older commits (`filter-branch` + `--force-with-lease`, `c8d4a22`→`fd44d61`) and removed the attribution footer from the PR. Recorded the no-attribution rule in memory + global `~/.claude/CLAUDE.md`.

## What's unfinished / open questions
- **PR #2 is open and unmerged** — review/merge it (or keep iterating on the branch) before starting Phase 3.
- The Docker `frontend` container is built from old code — `docker compose up -d --build frontend` to make the *stack* serve the new drop-in UI (the code itself is committed + verified).
- Kafka image choice — using apache/kafka KRaft single-broker (no Zookeeper)
- Hosted Supabase DB password must be set in local `.env` as `SUPABASE_DB_PASSWORD`
- Benign log noise: dropin warns "Spring Data Redis could not identify store assignment" for the JPA repos (Redis repo-scanning); harmless, silence later by scoping Redis repositories.
- `courts.courts` currently has RLS disabled. Fine for backend-only JDBC during the skeleton; revisit before any Supabase Data API / client-side access.

## What's next (one finishable chunk)
**Open a PR for `feature/global-exception-handler` and merge it** (PR #3 for the user vertical
is already merged), then the last Phase 3 slice: **messaging + payment placeholder services** —
each gets its Flyway V1 (per the hardened DBML), an empty feature package skeleton, and stays
bootable. **Done when** the full `docker compose up` stack is healthy with all services
validating their schemas.

Out of scope (parked):
- `PUT /users/{id}` (MASTER lists it; small follow-up to the user vertical)
- MASTER.md §8.6/§10.3 still say "Booking acquires a row lock on drop_ins.confirmed_players" —
  contradicts the decided ReserveSlot/ReleaseSlot gRPC design; reconcile in a MASTER edit
- Phase 2 deferred: migrate Kafka event payloads from JSON to Protobuf (touches Go + search + TS)
- Phase 3 rest: messaging/payment placeholders, cross-cutting error handling
- Later: auth, Redis locking, WebSocket chat, Resend email, Stripe, Elasticsearch, k8s, Rust analytics
