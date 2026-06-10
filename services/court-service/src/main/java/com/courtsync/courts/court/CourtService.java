package com.courtsync.courts.court;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.courtsync.courts.court.dto.CourtResponse;
import com.courtsync.courts.court.dto.CreateCourtRequest;

/**
 * Court business logic. The controller stays thin (HTTP only); anything that
 * isn't request/response plumbing lives here. Constructor injection (no @Autowired
 * needed for a single constructor) gives us the repository.
 */
@Service
public class CourtService {

    private final CourtRepository repository;

    public CourtService(CourtRepository repository) {
        this.repository = repository;
    }

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
        return CourtResponse.from(repository.save(court));
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
