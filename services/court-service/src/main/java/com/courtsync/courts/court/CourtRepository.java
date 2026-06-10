package com.courtsync.courts.court;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access for courts. Extending JpaRepository gives us save/findById/findAll/
 * deleteById etc. for free — Spring generates the implementation at runtime, so
 * we write no SQL for basic CRUD. The two type params are <Entity, ID type>.
 */
public interface CourtRepository extends JpaRepository<Court, UUID> {
}
