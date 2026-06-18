package com.courtsync.users.user.service;

import com.courtsync.users.user.domain.User;
import com.courtsync.users.user.dto.UpdateUserProfileRequest;
import com.courtsync.users.user.dto.UserResponse;
import com.courtsync.users.user.exception.EmailAlreadyExistsException;
import com.courtsync.users.user.exception.UserNotFoundException;
import com.courtsync.users.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository repository;

    @Transactional
    public UserResponse upsertCurrentUser(UUID authUserId, String email, UpdateUserProfileRequest req) {
        repository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(authUserId))
                .ifPresent(existing -> {
                    throw new EmailAlreadyExistsException(email);
                });

        User user = repository.findById(authUserId).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(authUserId);
            return newUser;
        });

        user.setEmail(email);
        user.setFirstName(blankToNull(req.firstName()));
        user.setLastName(blankToNull(req.lastName()));
        user.setSkillLevel(req.skillLevel());

        User saved = repository.save(user);
        log.info("User profile upserted: id={} email={}", saved.getId(), saved.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return UserResponse.from(user);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
