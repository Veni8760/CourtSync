package com.courtsync.users.user.controller;

import com.courtsync.users.user.dto.UpdateUserProfileRequest;
import com.courtsync.users.user.dto.UserResponse;
import com.courtsync.users.user.exception.InvalidAuthTokenException;
import com.courtsync.users.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return service.findById(currentUserId(jwt));
    }

    @PutMapping("/me")
    public UserResponse updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        return service.upsertCurrentUser(currentUserId(jwt), currentEmail(jwt), request);
    }

    private UUID currentUserId(Jwt jwt) {
        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new InvalidAuthTokenException("missing sub claim");
        }
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException ex) {
            throw new InvalidAuthTokenException("sub claim is not a UUID");
        }
    }

    private String currentEmail(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new InvalidAuthTokenException("missing email claim");
        }
        return email;
    }
}
