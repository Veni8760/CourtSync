package com.courtsync.notifications.alert.service;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.courtsync.notifications.alert.domain.Alert;
import com.courtsync.notifications.alert.domain.AlertType;
import com.courtsync.notifications.alert.dto.AlertResponse;
import com.courtsync.notifications.alert.repository.AlertRepository;
import com.courtsync.notifications.config.CacheConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * The alert feed. Two very different callers meet here:
 *   - the Kafka consumer WRITES alerts ({@link #record}), and
 *   - the REST controller READS them and marks them read.
 *
 * Every write path evicts the user's cached unread count, so the badge can never
 * be stale by more than the moment between the DB commit and the eviction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository repository;

    /**
     * Write one alert, unless this exact publish already produced one for this
     * user. Returns false when the event was a Kafka redelivery, so the consumer
     * can log it as skipped rather than treating it as new.
     */
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.UNREAD_COUNT_CACHE, key = "#userId")
    public boolean record(UUID userId, UUID dropInId, AlertType type, String message, String eventKey) {
        if (repository.existsByUserIdAndDropInIdAndEventKey(userId, dropInId, eventKey)) {
            return false;
        }
        Alert alert = new Alert();
        alert.setUserId(userId);
        alert.setDropInId(dropInId);
        alert.setType(type);
        alert.setMessage(message);
        alert.setEventKey(eventKey);
        repository.save(alert);

        log.info("Alert raised: user={} dropIn={} type={}", userId, dropInId, type);
        return true;
    }

    /** Everyone who has ever been alerted about this drop-in — the cancellation fan-out. */
    @Transactional(readOnly = true)
    public List<UUID> recipientsFor(UUID dropInId) {
        return repository.findRecipientsByDropInId(dropInId);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> feed(UUID userId) {
        return repository.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(AlertResponse::from)
                .toList();
    }

    /**
     * The badge count. Read on every authenticated page load, changed only by an
     * inbound event or by the user opening the feed — exactly the shape a cache
     * is for. Redis-backed; both mutators below evict it.
     */
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.UNREAD_COUNT_CACHE, key = "#userId")
    public long unreadCount(UUID userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    /** Scoped by userId so marking someone else's alert read is a silent no-op. */
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.UNREAD_COUNT_CACHE, key = "#userId")
    public void markRead(UUID id, UUID userId) {
        repository.markRead(id, userId);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.UNREAD_COUNT_CACHE, key = "#userId")
    public void markAllRead(UUID userId) {
        repository.markAllRead(userId);
    }
}
