package com.courtsync.users.user.controller;

import com.courtsync.users.config.SecurityConfig;
import com.courtsync.users.user.domain.SkillLevel;
import com.courtsync.users.user.domain.UserRole;
import com.courtsync.users.user.dto.UpdateUserProfileRequest;
import com.courtsync.users.user.dto.UserResponse;
import com.courtsync.users.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringJUnitWebConfig(classes = {
        UserController.class,
        SecurityConfig.class,
        UserControllerSecurityTests.TestConfig.class
})
class UserControllerSecurityTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        reset(service);
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }
    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateMeUsesJwtSubjectAndEmail() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        String email = "player@example.com";
        UserResponse response = new UserResponse(
                userId,
                email,
                "Ada",
                "Lovelace",
                SkillLevel.ADVANCED,
                UserRole.PLAYER,
                Instant.parse("2026-06-12T12:00:00Z"),
                Instant.parse("2026-06-12T12:00:00Z"));

        when(service.upsertCurrentUser(eq(userId), eq(email), any(UpdateUserProfileRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/users/me")
                        .with(jwt().jwt(jwt -> jwt
                                .subject(userId.toString())
                                .claim("email", email)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Ada",
                                  "lastName": "Lovelace",
                                  "skillLevel": "ADVANCED",
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(userId.toString())))
                .andExpect(jsonPath("$.email", is(email)))
                .andExpect(jsonPath("$.role", is("PLAYER")));

        verify(service).upsertCurrentUser(
                eq(userId),
                eq(email),
                eq(new UpdateUserProfileRequest("Ada", "Lovelace", SkillLevel.ADVANCED)));
    }

    @Configuration
    @EnableWebMvc
    static class TestConfig {
        @Bean
        UserService userService() {
            return mock(UserService.class);
        }

        @Bean
        JwtDecoder jwtDecoder() {
            return token -> {
                throw new UnsupportedOperationException("JWT decoding is bypassed by spring-security-test");
            };
        }
    }
}
