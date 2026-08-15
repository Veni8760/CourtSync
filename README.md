# CourtSync

A volleyball drop-in app. Find a session near you, claim a spot, join the waitlist if it's
full, and get told when a spot opens up.

It's a learning project for microservice patterns: six Spring Boot services behind a
gateway, gRPC for synchronous calls between them, Kafka for everything async, and an
Elasticsearch index over Postgres for search.

## What it does

**Courts and drop-ins.** Create a court, then host drop-ins at it. Before dropin-service
saves a session it calls court-service over gRPC to check the court exists.

**RSVPs and waitlists.** When a drop-in is full you go into a FIFO queue instead of getting
a 409. If a confirmed player cancels, the longest-waiting player is promoted automatically,
under the same row lock that freed the spot, so the seat is never briefly open.

**Player alerts.** RSVPs, waitlist placements, promotions, and cancellations are published
to Kafka. notification-service consumes them into a per-user alert feed with an unread
badge. Delivery is at-least-once, so writes are deduplicated on a unique event key.

**Search.** search-service consumes the same event stream into an Elasticsearch index and
serves "drop-ins near me" from it. Postgres is never queried for search. Repeat queries are
cached in Redis for 60 seconds.

## Stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Frontend  | Next.js, TypeScript, Tailwind, shadcn/ui             |
| Services  | Java 21, Spring Boot 4.0.x, Maven                    |
| Sync RPC  | gRPC (dropin to court), contract in `shared/proto/`  |
| Async     | Kafka (KRaft, no Zookeeper)                          |
| Database  | Supabase Postgres, one schema per service, Flyway    |
| Search    | Elasticsearch                                        |
| Cache     | Redis                                                |
| Local dev | Docker Compose                                       |

## Services

| Service              | Port        | Role                                      |
| -------------------- | ----------- | ----------------------------------------- |
| api-gateway          | 8080        | Spring Cloud Gateway, routing only        |
| user-service         | 8081        | profiles                                  |
| court-service        | 8082 + 9090 | courts, gRPC server                       |
| dropin-service       | 8083        | drop-ins, RSVPs, waitlist, Kafka producer |
| notification-service | 8086        | player alerts, Kafka consumer             |
| search-service       | 8087        | Elasticsearch read model, Kafka consumer  |
| frontend             | 3000        | Next.js app                               |

Those are the ports inside the Compose network. On the host, court-service is published on
8092 (and its gRPC port on 9190) to avoid a clash. Everything goes through the gateway
anyway.

## Running it

```bash
cp .env.example .env       # set SUPABASE_DB_PASSWORD
docker compose up --build
```

Then open http://localhost:3000. Set `FRONTEND_PORT` in `.env` if 3000 is taken.

To run one service from your IDE against the rest of the infrastructure:

```bash
docker compose up kafka redis elasticsearch
```

## Database

```bash
scripts/supabase-psql.sh           # connect
scripts/supabase-psql.sh dropins   # connect with a schema on the search path
```

```sql
\dn                        -- users, courts, dropins, notifications
\dt dropins.*
\d dropins.drop_in_players
```

## Layout

```
services/frontend/          Next.js app
services/*-service/         One Maven project each
shared/proto/               gRPC contracts
shared/event-contracts/     Kafka event shapes
infra/postgres/init.sql     Optional local Postgres bootstrap
scripts/                    Dev helpers
tasks/                      Status and next steps
```

## More detail

[`MASTER.md`](MASTER.md) covers scope, architecture, the data model, the concurrency design
behind the RSVP and waitlist path, and what was deliberately left out.
[`shared/event-contracts/events.md`](shared/event-contracts/events.md) is the Kafka wire
contract.

## License

No license chosen yet, so default copyright applies.
