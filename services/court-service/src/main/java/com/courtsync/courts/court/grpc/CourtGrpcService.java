package com.courtsync.courts.court.grpc;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.courtsync.courts.court.dto.CourtResponse;
import com.courtsync.courts.court.exception.CourtNotFoundException;
import com.courtsync.courts.court.service.CourtService;
import com.courtsync.proto.court.v1.Court;
import com.courtsync.proto.court.v1.CourtServiceGrpc;
import com.courtsync.proto.court.v1.GetCourtRequest;
import com.courtsync.proto.court.v1.GetCourtResponse;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * gRPC server side of the court contract (shared/proto/court.proto).
 *
 * This is the synchronous read API other services call — e.g. dropin-service
 * validating a court exists before creating a drop-in. It is a thin adapter:
 * it owns NO business logic, it just translates between the gRPC wire types and
 * our existing {@link CourtService}, reusing the same lookup the REST API uses.
 *
 * Spring gRPC auto-registers any {@code BindableService} bean (the generated base
 * class implements it) with its gRPC server, which listens on a separate HTTP/2
 * port from the REST server. We extend the generated base and override our one RPC.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourtGrpcService extends CourtServiceGrpc.CourtServiceImplBase {

    private final CourtService courtService;

    @Override
    public void getCourt(GetCourtRequest request, StreamObserver<GetCourtResponse> responseObserver) {
        // proto3 has no UUID type — courts are identified by a string id on the wire.
        UUID id;
        try {
            id = UUID.fromString(request.getId());
        } catch (IllegalArgumentException e) {
            // Malformed id is a client mistake → INVALID_ARGUMENT (≈ HTTP 400), not NOT_FOUND.
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("Not a valid court id: " + request.getId())
                    .asRuntimeException());
            return;
        }

        try {
            CourtResponse court = courtService.findById(id);
            log.info("gRPC GetCourt served: id={}", id);
            responseObserver.onNext(toResponse(court));
            responseObserver.onCompleted();
        } catch (CourtNotFoundException e) {
            // Map our domain 404 onto the gRPC equivalent so the caller can react to it.
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }

    private GetCourtResponse toResponse(CourtResponse c) {
        Court.Builder court = Court.newBuilder()
                .setId(c.id().toString())
                .setName(c.name())
                // Enums travel as their name string (e.g. "BEACH", "COED") for v1 simplicity.
                .setSurface(c.surface().name())
                .setNetHeight(c.netHeight().name());
        // Location is optional on the court; only set present fields so the client
        // can tell "no coordinates" apart from a real (0,0).
        if (c.latitude() != null) {
            court.setLatitude(c.latitude());
        }
        if (c.longitude() != null) {
            court.setLongitude(c.longitude());
        }
        if (c.city() != null) {
            court.setCity(c.city());
        }
        return GetCourtResponse.newBuilder().setCourt(court.build()).build();
    }
}
