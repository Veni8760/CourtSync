package com.courtsync.dropins.dropin.grpc;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.courtsync.proto.court.v1.CourtServiceGrpc.CourtServiceBlockingStub;
import com.courtsync.proto.court.v1.GetCourtRequest;

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

    /**
     * @return true if court-service knows this court, false if it returned NOT_FOUND.
     * @throws StatusRuntimeException for any other failure (e.g. court-service down) —
     *         that's an infrastructure problem, distinct from "the court doesn't exist".
     */
    public boolean courtExists(UUID courtId) {
        try {
            courtServiceStub.getCourt(GetCourtRequest.newBuilder()
                    .setId(courtId.toString())
                    .build());
            return true;
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.NOT_FOUND) {
                return false;
            }
            log.error("gRPC GetCourt call failed for court={}: {}", courtId, e.getStatus());
            throw e;
        }
    }
}
