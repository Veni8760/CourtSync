package com.courtsync.users.user.controller;

import com.courtsync.users.user.dto.CreateUserRequest;
import com.courtsync.users.user.dto.UserResponse;
import com.courtsync.users.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<UserResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable UUID id) {
        return service.findById(id);
    }
}
