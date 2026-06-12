package com.courtsync.users.user.dto;

import com.courtsync.users.user.domain.SkillLevel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,
        String firstName,
        String lastName,
        SkillLevel skillLevel) {
}
