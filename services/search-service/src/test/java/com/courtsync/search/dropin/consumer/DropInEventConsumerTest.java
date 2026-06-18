package com.courtsync.search.dropin.consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.courtsync.search.dropin.document.DropInDocument;
import com.courtsync.search.dropin.repository.DropInSearchRepository;

import tools.jackson.databind.json.JsonMapper;

/**
 * Drives the consumer directly with raw JSON (no broker, no Elasticsearch): a
 * DROP_IN_CREATED is mapped to a document with a geo_point, and other event types
 * on the same topic are ignored.
 */
@ExtendWith(MockitoExtension.class)
class DropInEventConsumerTest {

    @Mock
    private DropInSearchRepository repository;

    private DropInEventConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new DropInEventConsumer(repository, JsonMapper.builder().build());
    }

    @Test
    void indexesDropInCreatedWithGeoPoint() {
        String json = """
                {"eventType":"DROP_IN_CREATED","dropInId":"d1","courtId":"c1",
                 "organizerUserId":"u1","startTime":"2026-07-01T18:00:00Z",
                 "latitude":43.65,"longitude":-79.38,"city":"Toronto",
                 "timestamp":"2026-06-18T20:00:00Z"}""";

        consumer.onDropinEvent(json);

        ArgumentCaptor<DropInDocument> captor = ArgumentCaptor.forClass(DropInDocument.class);
        verify(repository).save(captor.capture());
        DropInDocument doc = captor.getValue();
        assertThat(doc.getId()).isEqualTo("d1");
        assertThat(doc.getCity()).isEqualTo("Toronto");
        assertThat(doc.getLocation().getLat()).isEqualTo(43.65);
        assertThat(doc.getLocation().getLon()).isEqualTo(-79.38);
    }

    @Test
    void ignoresNonDropInCreatedEvents() {
        String rsvp = """
                {"eventType":"RSVP_CREATED","dropInId":"d1","userId":"u1",
                 "timestamp":"2026-06-18T20:00:00Z"}""";

        consumer.onDropinEvent(rsvp);

        verifyNoInteractions(repository);
    }
}
