package com.courtsync.users.user.dto;

import com.courtsync.users.user.domain.SkillLevel;

import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @Size(max = 100, message = "firstName must be at most 100 characters")
        String firstName,
        @Size(max = 100, message = "lastName must be at most 100 characters")
        String lastName,
        SkillLevel skillLevel) {
}
