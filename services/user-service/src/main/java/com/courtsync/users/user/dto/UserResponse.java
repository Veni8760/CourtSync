package com.courtsync.users.user.dto;

import com.courtsync.users.user.domain.SkillLevel;
import com.courtsync.users.user.domain.User;
import com.courtsync.users.user.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        SkillLevel skillLevel,
        UserRole role,
        Instant createdAt,
        Instant updatedAt) {

    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getSkillLevel(),
                u.getRole(),
                u.getCreatedAt(),
                u.getUpdatedAt());
    }
}
