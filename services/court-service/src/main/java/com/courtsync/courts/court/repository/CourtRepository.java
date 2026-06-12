package com.courtsync.courts.court.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courtsync.courts.court.domain.Court;

/**
 * Data access for courts. Extending JpaRepository gives save/findById/findAll/
 * deleteById for free — Spring generates the implementation at runtime, so we
 * write no SQL for basic CRUD. Type params are <Entity, ID type>.
 */
public interface CourtRepository extends JpaRepository<Court, UUID> {
}
