package com.courtsync.courts.court.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.courtsync.courts.court.domain.Court;
import com.courtsync.courts.court.dto.CourtResponse;
import com.courtsync.courts.court.dto.CreateCourtRequest;
import com.courtsync.courts.court.exception.CourtNotFoundException;
import com.courtsync.courts.court.repository.CourtRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Court business logic. The controller stays thin (HTTP only); anything that
 * isn't request/response plumbing lives here. @RequiredArgsConstructor generates
 * the constructor that injects the repository.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourtService {

    private final CourtRepository repository;

    @Transactional
    public CourtResponse create(CreateCourtRequest req) {
        Court court = new Court();
        court.setName(req.name());
        court.setAddress(req.address());
        court.setCity(req.city());
        court.setProvince(req.province());
        court.setLatitude(req.latitude());
        court.setLongitude(req.longitude());
        court.setSurface(req.surface());
        court.setNetHeight(req.netHeight());
        Court saved = repository.save(court);
        log.info("Court created: id={} name='{}'", saved.getId(), saved.getName());
        return CourtResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CourtResponse> findAll() {
        return repository.findAll().stream().map(CourtResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CourtResponse findById(UUID id) {
        Court court = repository.findById(id)
                .orElseThrow(() -> new CourtNotFoundException(id));
        return CourtResponse.from(court);
    }
}
