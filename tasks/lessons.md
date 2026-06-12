# Lessons


Patterns and corrections captured across sessions. Append new entries with a date and a one-line "what went wrong / what to do instead."

## 2026-06-10

- **A green `mvn package` does NOT prove framework compatibility — run the app.** spring-grpc 1.0.3 compiled fine on Boot 3.5.14 but crashed at *runtime* (`NoClassDefFoundError: PropertyMapper$Source$Adapter`, gRPC `Duration.toNanos()` NPE) because the whole 1.0.x line targets Boot 4.0.x. Pin library↔Boot pairs from the library's own release attributes (spring-grpc git tag `attributes-variables.adoc` → `spring-boot-version`), and always boot the service, not just build it.
- **Docker build context can't see files above it; `shared/proto` needs a root context.** Per-service `build: ./services/x` can't `COPY ../../shared/proto` (Docker forbids paths outside the context). Fix: set `build.context: .` (repo root) + `dockerfile: services/x/Dockerfile`, recreate the repo layout inside the image (`/build/services/x` + `/build/shared/proto`) so the pom's `../../shared/proto` resolves unchanged, and add a root `.dockerignore`.
- **Hosted Supabase from Docker on macOS: use the IPv4 Session Pooler, not the direct endpoint.** `db.<ref>.supabase.co` is IPv6-only → `Network is unreachable` from Docker's IPv4 bridge (enabling Docker IPv6 doesn't help; the Mac VM has no outbound IPv6 NAT). Switch `SUPABASE_JDBC_BASE_URL` to `aws-1-<region>.pooler.supabase.com:5432` (Session pooler, port 5432) and `SUPABASE_DB_USER` to `postgres.<project-ref>`.
- **Spring Boot 3.5 → 4.0 migration gotchas (all runtime-only):** (1) autoconfig is modular — Kafka needs `spring-boot-starter-kafka`, the raw `spring-kafka` artifact no longer autoconfigures `KafkaTemplate`/listeners; (2) default mapper is **Jackson 3** (`tools.jackson.*`, unchecked `JacksonException`) — Jackson-2 (`com.fasterxml.jackson.*`) `ObjectMapper` bean is no longer created; migrate imports; (3) **Hibernate 7** validates nullability strictly — entity `@Column(nullable=false)` must match `NOT NULL` columns; (4) api-gateway → Spring Cloud `2025.1.x` (Boot-4 train, SCG 5.0).

## 2026-06-09

- **Workflow: explain before doing + narrate commands.** Daniel is learning — before each chunk, explain the concept/why first; when debugging, narrate what each command tests and what it revealed. Don't just dump fixes.
- **Kafka (apache/kafka image) — never put `0.0.0.0` in `KAFKA_LISTENERS`.** The image derives `advertised.listeners` from `KAFKA_LISTENERS`, and `0.0.0.0` is rejected ("advertised.listeners cannot use the nonroutable meta-address 0.0.0.0"). Use the empty-host form `PLAINTEXT://:9092,CONTROLLER://:9093` and set `KAFKA_ADVERTISED_LISTENERS` to the routable hostname (`kafka:9092`). Confirmed against Apache's official docker-compose examples (single-node + cluster/combined).
- **Debugging Docker images: read the image's own config, don't guess.** `docker run --entrypoint bash <image> -c '...'` to inspect default config files / scripts; isolate the broken container with `docker run` instead of rebuilding the whole compose stack to iterate fast.
- **"No space left on device" during `docker compose build` = Docker disk full, not a code bug.** `docker system df` to confirm, `docker system prune -af` to reclaim.
- **Next.js in Docker: server-side fetches need an internal service URL.** `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api` is fine for browser calls, but RSC/server actions inside the frontend container need `COURTSYNC_API_BASE_URL=http://api-gateway:8080/api`.
- **Next server action files should export actions, not shared client constants.** A client component importing `initialState` from a `"use server"` file prerendered with that value as `undefined`; keep client initial state in the client component or a neutral shared module.
