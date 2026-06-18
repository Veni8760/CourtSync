package com.courtsync.dropins.dropin.grpc;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelFactory;

import com.courtsync.proto.court.v1.CourtServiceGrpc;
import com.courtsync.proto.court.v1.CourtServiceGrpc.CourtServiceBlockingStub;

/**
 * Builds the gRPC client stub for court-service once, as a Spring bean.
 *
 * GrpcChannelFactory resolves the named channel "court-service" (its address is
 * configured in application.yaml) into a long-lived, reusable HTTP/2 channel. From
 * that channel we derive a BLOCKING stub — synchronous calls, which is exactly what
 * we want when validating a court before saving a drop-in.
 */
@Configuration
public class CourtGrpcClientConfig {

    @Bean
    CourtServiceBlockingStub courtServiceStub(GrpcChannelFactory channels) {
        return CourtServiceGrpc.newBlockingStub(channels.createChannel("court-service"));
    }
}
