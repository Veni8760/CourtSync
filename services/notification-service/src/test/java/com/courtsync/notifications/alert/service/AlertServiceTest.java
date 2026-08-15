package com.courtsync.notifications.alert.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.courtsync.notifications.alert.domain.Alert;
import com.courtsync.notifications.alert.domain.AlertType;
import com.courtsync.notifications.alert.repository.AlertRepository;

/**
 * The one piece of logic AlertService owns beyond delegation: refusing to write
 * the same alert twice when Kafka redelivers an event.
 */
@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository repository;
    @InjectMocks
    private AlertService service;

    @Test
    void record_writesTheAlertTheFirstTime() {
        UUID userId = UUID.randomUUID(), dropInId = UUID.randomUUID();
        when(repository.existsByUserIdAndDropInIdAndEventKey(userId, dropInId, "k")).thenReturn(false);

        boolean written = service.record(userId, dropInId, AlertType.PROMOTED, "you're in", "k");

        assertThat(written).isTrue();
        verify(repository).save(any(Alert.class));
    }

    @Test
    void record_skipsARedeliveredEvent() {
        UUID userId = UUID.randomUUID(), dropInId = UUID.randomUUID();
        when(repository.existsByUserIdAndDropInIdAndEventKey(userId, dropInId, "k")).thenReturn(true);

        boolean written = service.record(userId, dropInId, AlertType.PROMOTED, "you're in", "k");

        assertThat(written).isFalse();
        verify(repository, never()).save(any());
    }
}
