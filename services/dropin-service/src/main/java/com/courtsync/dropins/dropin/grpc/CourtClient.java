package com.courtsync.dropins.dropin.grpc;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.courtsync.proto.court.v1.Court;
import com.courtsync.proto.court.v1.CourtServiceGrpc.CourtServiceBlockingStub;
import com.courtsync.proto.court.v1.GetCourtRequest;
import com.courtsync.proto.court.v1.GetCourtResponse;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Thin wrapper over the generated court-service gRPC stub. It hides gRPC mechanics
 * (request builders, status codes) from the rest of dropin-service, exposing a plain
 * boolean the domain can reason about.
 *
 * This is the ONE synchronous service-to-service call in the system: a downstream
 * service (dropin) asking the data owner (court) a question. Async "X happened"
 * notifications still go over Kafka — this is request/response, so it's gRPC.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CourtClient {

    private final CourtServiceBlockingStub courtServiceStub;

    /** Just the court fields dropin-service denormalizes onto a drop-in. */
    public record CourtView(Double latitude, Double longitude, String city) {
    }

    /**
     * Look up a court for validation + location denormalization.
     *
     * @return the court's location view if court-service knows it; empty if it
     *         returned NOT_FOUND (so the caller can raise its own domain error).
     * @throws StatusRuntimeException for any other failure (e.g. court-service down) —
     *         that's an infrastructure problem, distinct from "the court doesn't exist".
     */
    public Optional<CourtView> getCourt(UUID courtId) {
        try {
            GetCourtResponse response = courtServiceStub.getCourt(GetCourtRequest.newBuilder()
                    .setId(courtId.toString())
                    .build());
            Court c = response.getCourt();
            // proto `optional` → use hasX() so an absent coordinate stays null,
            // never a fabricated (0,0).
            return Optional.of(new CourtView(
                    c.hasLatitude() ? c.getLatitude() : null,
                    c.hasLongitude() ? c.getLongitude() : null,
                    c.hasCity() ? c.getCity() : null));
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            log.error("gRPC GetCourt call failed for court={}: {}", courtId, e.getStatus());
            throw e;
        }
    }
}
