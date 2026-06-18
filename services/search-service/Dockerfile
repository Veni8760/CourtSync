# syntax=docker/dockerfile:1
# Build context is this service directory (set in docker-compose.yml). Unlike
# court/dropin, search-service has no shared/proto dependency, so a plain context works.

# --- Stage 1: build the jar with the JDK + Maven wrapper ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /build

# Resolve dependencies first so this layer is cached until pom.xml changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# Now copy sources and build (skip tests in the image build).
COPY src/ src/
RUN ./mvnw -B -DskipTests package

# --- Stage 2: slim runtime with only a JRE + the built jar ---
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
