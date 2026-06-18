package com.courtsync.dropins.dropin.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.courtsync.dropins.dropin.domain.DropIn;
import com.courtsync.dropins.dropin.domain.DropInStatus;
import com.courtsync.dropins.dropin.dto.CreateDropInRequest;
import com.courtsync.dropins.dropin.dto.DropInResponse;
import com.courtsync.dropins.dropin.exception.CourtNotFoundException;
import com.courtsync.dropins.dropin.exception.DropInNotFoundException;
import com.courtsync.dropins.dropin.grpc.CourtClient;
import com.courtsync.dropins.dropin.repository.DropInRepository;
import com.courtsync.dropins.event.DropinEventPublisher;
import com.courtsync.dropins.event.DropinEvents;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Drop-in business logic for the drop-in aggregate itself: create / list / get.
 *
 * Capacity rules live on the DropIn entity (reserveSpot/releaseSpot); player rows
 * live in the rsvp package. This service therefore does NOT depend on rsvp — it
 * exposes lockForUpdate() as the single seam the rsvp package calls into.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DropInService {

    private final DropInRepository repository;
    private final DropinEventPublisher events;
    private final CourtClient courtClient;

    @Transactional
    public DropInResponse create(CreateDropInRequest req) {
        // Cross-field rule a single-field annotation can't express → 400 here.
        if (!req.endTime().isAfter(req.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }

        // courts live in another service — we can't FK to them, so validate over gRPC
        // that the court actually exists before persisting a drop-in that points at it.
        if (!courtClient.courtExists(req.courtId())) {
            throw new CourtNotFoundException(req.courtId());
        }

        DropIn dropIn = new DropIn();
        dropIn.setCourtId(req.courtId());
        dropIn.setOrganizerUserId(req.organizerUserId());
        dropIn.setTitle(req.title());
        dropIn.setDescription(req.description());
        dropIn.setStartTime(req.startTime());
        dropIn.setEndTime(req.endTime());
        dropIn.setMaxPlayers(req.maxPlayers());
        dropIn.setPrice(req.price() != null ? req.price() : BigDecimal.ZERO);
        dropIn.setSkillLevel(req.skillLevel());
        dropIn.setStatus(DropInStatus.OPEN);

        DropIn saved = repository.save(dropIn);
        log.info("Drop-in created: id={} court={} maxPlayers={}",
                saved.getId(), saved.getCourtId(), saved.getMaxPlayers());

        events.publishDropInCreated(DropinEvents.DropInCreated.of(
                saved.getId(), saved.getCourtId(), saved.getOrganizerUserId(), saved.getStartTime()));

        return DropInResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<DropInResponse> findAll() {
        return repository.findAll().stream().map(DropInResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public DropInResponse findById(UUID id) {
        DropIn dropIn = repository.findById(id)
                .orElseThrow(() -> new DropInNotFoundException(id));
        return DropInResponse.from(dropIn);
    }

    /**
     * Load a drop-in WITH a pessimistic write lock, for the RSVP/cancel flows.
     * Must be called inside an active transaction (the caller's @Transactional) —
     * the lock is held until that transaction commits. This is the only method
     * the rsvp package uses; everything it then does goes through the returned
     * managed entity (reserveSpot/releaseSpot), which Hibernate flushes on commit.
     */
    @Transactional
    public DropIn lockForUpdate(UUID id) {
        return repository.findByIdForUpdate(id)
                .orElseThrow(() -> new DropInNotFoundException(id));
    }
}
