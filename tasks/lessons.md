# Lessons


Patterns and corrections captured across sessions. Append new entries with a date and a one-line "what went wrong / what to do instead."

## 2026-06-09

- **Workflow: explain before doing + narrate commands.** Daniel is learning — before each chunk, explain the concept/why first; when debugging, narrate what each command tests and what it revealed. Don't just dump fixes.
- **Kafka (apache/kafka image) — never put `0.0.0.0` in `KAFKA_LISTENERS`.** The image derives `advertised.listeners` from `KAFKA_LISTENERS`, and `0.0.0.0` is rejected ("advertised.listeners cannot use the nonroutable meta-address 0.0.0.0"). Use the empty-host form `PLAINTEXT://:9092,CONTROLLER://:9093` and set `KAFKA_ADVERTISED_LISTENERS` to the routable hostname (`kafka:9092`). Confirmed against Apache's official docker-compose examples (single-node + cluster/combined).
- **Debugging Docker images: read the image's own config, don't guess.** `docker run --entrypoint bash <image> -c '...'` to inspect default config files / scripts; isolate the broken container with `docker run` instead of rebuilding the whole compose stack to iterate fast.
- **"No space left on device" during `docker compose build` = Docker disk full, not a code bug.** `docker system df` to confirm, `docker system prune -af` to reclaim.
- **Next.js in Docker: server-side fetches need an internal service URL.** `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api` is fine for browser calls, but RSC/server actions inside the frontend container need `COURTSYNC_API_BASE_URL=http://api-gateway:8080/api`.
- **Next server action files should export actions, not shared client constants.** A client component importing `initialState` from a `"use server"` file prerendered with that value as `undefined`; keep client initial state in the client component or a neutral shared module.
