# Session Handoff — Add Protobuf + gRPC service-to-service seam (dropin → court validation)

_Generated: 2026-06-10. Branch: `feature/dropin-rsvp-kafka`._

## Where it started
User asked how to share types across the polyglot monorepo. After discussion, decided to solve it
the "proper" way now: **Protobuf** for cross-service typing, **gRPC** for synchronous
service-to-service calls — REST stays at the browser edge, Kafka stays for async events. Learning
project: concepts were taught while building. Scope was held to one real seam, not a wholesale switch.

## Decisions locked + what shipped
- **Comms model (recorded in `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/CLAUDE.md` → "Inter-service communication & contracts"):**
  browser→backend = REST; service→service sync = gRPC; service→service async = Kafka (still JSON).
- **First sync seam:** `dropin-service` now validates the court exists over gRPC before creating a
  drop-in (previously stored an unvalidated bare `court_id`). court owns court data → court = server, dropin = client.
- **Shared contract:** `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/shared/proto/court.proto`
  (`CourtService.GetCourt`). Both services run `protoc` against this one file; neither shares compiled code.
- **court-service = gRPC server:** `services/court-service/src/main/java/com/courtsync/courts/court/grpc/CourtGrpcService.java`
  (extends generated base, reuses `CourtService.findById`, maps `CourtNotFoundException` → `Status.NOT_FOUND`).
  gRPC on port **9090**, REST stays **8082** (`court-service/src/main/resources/application.yaml`).
- **dropin-service = gRPC client:** `dropin/grpc/CourtGrpcClientConfig.java` (channel+stub bean) +
  `dropin/grpc/CourtClient.java` (`courtExists()`); new `dropin/exception/CourtNotFoundException.java` (**400**);
  call wired into `dropin/service/DropInService.java#create`. Named channel in `dropin-service/.../application.yaml`.
- **Build (both `pom.xml`):** Spring gRPC BOM `spring-grpc-dependencies:1.0.3` + `spring-grpc-spring-boot-starter`
  + `io.github.ascopes:protobuf-maven-plugin:4.0.3` (`sourceDirectories` → `../../shared/proto`).
  Pinned `protoc 4.28.2` / `grpc-java 1.69.0` (Boot 3.5.x's protobuf-java is 3.x — incompatible, do not inherit it).
- **docker-compose.yml:** court-service publishes `9090`; dropin-service gets
  `COURT_GRPC_ADDRESS=static://court-service:9090` + `depends_on court-service`.

## Key files for next session
- Plan file (read first): `/Users/danielvenistan/.claude/plans/iridescent-juggling-deer.md`
- `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/shared/proto/court.proto` — the contract
- `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/services/court-service/src/main/java/com/courtsync/courts/court/grpc/CourtGrpcService.java`
- `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/services/dropin-service/src/main/java/com/courtsync/dropins/dropin/grpc/CourtClient.java`
- `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/services/dropin-service/src/main/java/com/courtsync/dropins/dropin/service/DropInService.java`
- `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/CLAUDE.md` — comms/contracts standard
- `/Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/tasks/todo.md` — full Phase 2 checklist
- Memory files touched: none

## Running state
- Background processes: none
- Dev servers / ports: none currently running. When started: court REST 8082, court gRPC 9090,
  dropin 8083, gateway 8080, kafka 9092, redis 6379, notification 8086, search 8087, frontend 3000.
- Open worktrees / branches: `feature/dropin-rsvp-kafka` — all this session's changes are **uncommitted** (not committed this session).

## Verification — how to confirm things still work
- `cd /Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/services/court-service && ./mvnw -DskipTests compile` → BUILD SUCCESS (confirmed this session)
- `cd /Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync/services/dropin-service && ./mvnw -DskipTests compile` → BUILD SUCCESS (confirmed this session)
- `cd /Users/danielvenistan/Desktop/UniversityOfToronto/CourtSync && SUPABASE_DB_PASSWORD=dummy docker compose config --quiet` → COMPOSE_OK (confirmed this session)
- **NOT yet run (runtime):** set real `SUPABASE_DB_PASSWORD` in `.env`, then
  `docker compose up --build court-service dropin-service` (auto-starts kafka+redis).
  Expect: POST `/api/drop-ins` with bogus `court_id` → **400**; with a real seeded court id → **201**
  and court-service logs `gRPC GetCourt served`. For full Kafka fan-out add `notification-service search-service`.

## Deferred + open questions
- Deferred: **runtime E2E** — gRPC round-trip + hosted-Supabase boot have never been run.
- Deferred: **frontend** drop-in pages (`lib/dropins.ts` + `/drop-ins`, `/drop-ins/[id]`, `/drop-ins/create`); mind the recent-Next.js gotcha (check `services/frontend/node_modules/next/dist/docs/`).
- Deferred: **tests** for RSVP concurrency (pessimistic lock) + the new court-validation logic.
- Deferred (separate phase): migrate **Kafka event payloads to Protobuf** (touches Go notification-service + search-service + frontend TS + likely a schema registry).
- Open: hosted-Supabase direct endpoint may fail from Docker (IPv6) → switch `SUPABASE_JDBC_BASE_URL` to the Session Pooler URL and `SUPABASE_DB_USER` to `postgres.<project-ref>`.
- Open: nothing committed this session — user has not been asked whether to commit.

## Pick up here
Run the E2E (`SUPABASE_DB_PASSWORD` in `.env`, then `docker compose up --build court-service dropin-service`) to prove the gRPC validation live before adding more code; if the user prefers, move to the frontend drop-in pages instead.
