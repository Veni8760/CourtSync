# syntax=docker/dockerfile:1

# Build context is the REPO ROOT (set in docker-compose.yml) — not this service
# dir — because the protobuf-maven-plugin sources the gRPC contract from
# ../../shared/proto, which lives outside any single service directory. We
# recreate the repo's path layout inside the image so ${project.basedir}/../../shared/proto
# resolves exactly as it does on the host, with no pom changes.

# --- Stage 1: build the jar with the JDK + Maven wrapper ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /build/services/dropin-service

# Copy only what's needed to resolve dependencies first, so this layer is
# cached and re-used until pom.xml changes.
COPY services/dropin-service/.mvn/ .mvn/
COPY services/dropin-service/mvnw services/dropin-service/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# Shared gRPC contract — sourced by protobuf-maven-plugin at ../../shared/proto.
COPY shared/proto/ /build/shared/proto/

# Now copy sources and build (skip tests in the image build).
COPY services/dropin-service/src/ src/
RUN ./mvnw -B -DskipTests package

# --- Stage 2: slim runtime with only a JRE + the built jar ---
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /build/services/dropin-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
