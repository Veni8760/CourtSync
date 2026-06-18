package com.courtsync.search.dropin.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.courtsync.search.dropin.document.DropInDocument;
import com.courtsync.search.dropin.repository.DropInSearchRepository;

import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

/**
 * Consumes {@code dropin-events} and maintains the Elasticsearch read model. This
 * is the "event-driven" half of CQRS: writes happen in dropin-service (Postgres),
 * and each DROP_IN_CREATED is projected here into a searchable document.
 *
 * The topic also carries RSVP_CREATED / RSVP_CANCELLED — we decode every message
 * but only index DROP_IN_CREATED (filter on eventType).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DropInEventConsumer {

    private final DropInSearchRepository repository;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${courtsync.kafka.dropin-topic:dropin-events}",
            groupId = "${spring.kafka.consumer.group-id:search-service}")
    public void onDropinEvent(String message) {
        DropInCreatedEvent event;
        try {
            event = objectMapper.readValue(message, DropInCreatedEvent.class);
        } catch (JacksonException e) {
            // A poison/unparseable message must not wedge the partition — log and skip.
            log.warn("Skipping unparseable dropin event", e);
            return;
        }

        if (!"DROP_IN_CREATED".equals(event.eventType())) {
            log.debug("Ignoring {} event", event.eventType());
            return;
        }

        repository.save(toDocument(event));
        log.info("Indexed drop-in {} (city={})", event.dropInId(), event.city());
    }

    private DropInDocument toDocument(DropInCreatedEvent e) {
        DropInDocument doc = new DropInDocument();
        doc.setId(e.dropInId());
        doc.setCourtId(e.courtId());
        doc.setOrganizerUserId(e.organizerUserId());
        doc.setStartTime(e.startTime());
        doc.setCity(e.city());
        // Only set the geo_point when both coordinates are present — never (0,0).
        if (e.latitude() != null && e.longitude() != null) {
            doc.setLocation(new GeoPoint(e.latitude(), e.longitude()));
        }
        return doc;
    }
}
