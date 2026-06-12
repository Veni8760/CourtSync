package com.courtsync.users.user.service;

import com.courtsync.users.user.domain.User;
import com.courtsync.users.user.dto.CreateUserRequest;
import com.courtsync.users.user.dto.UserResponse;
import com.courtsync.users.user.exception.EmailAlreadyExistsException;
import com.courtsync.users.user.exception.UserNotFoundException;
import com.courtsync.users.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository repository;

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        // Friendly 409 for the common case; the DB UNIQUE constraint on email
        // remains the backstop for concurrent creates that pass this check.
        if (repository.existsByEmail(req.email())) {
            throw new EmailAlreadyExistsException(req.email());
        }
        User user = new User();
        user.setEmail(req.email());
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setSkillLevel(req.skillLevel());
        User saved = repository.save(user);
        log.info("User created: id={} email={}", saved.getId(), saved.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return repository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return UserResponse.from(user);
    }
}
