# syntax=docker/dockerfile:1

# --- Stage 1: compile a static Go binary ---
FROM golang:1.26 AS build
WORKDIR /app

# Dependency layer: cached until go.mod/go.sum change.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# CGO disabled -> a fully static binary that runs on a bare image.
RUN CGO_ENABLED=0 GOOS=linux go build -o /notification-service ./cmd/notification-service

# --- Stage 2: distroless runtime (just the binary, no shell/OS) ---
FROM gcr.io/distroless/static-debian12 AS runtime
COPY --from=build /notification-service /notification-service
EXPOSE 8086
ENTRYPOINT ["/notification-service"]
