package com.courtsync.courts.court.controller;

import com.courtsync.courts.config.SecurityConfig;
import com.courtsync.courts.court.service.CourtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies the resource-server filter chain: court endpoints reject anonymous
 * requests (401) and accept a valid JWT. JWT decoding itself is bypassed by
 * spring-security-test, so no real Supabase token is needed.
 */
@SpringJUnitWebConfig(classes = {
        CourtController.class,
        SecurityConfig.class,
        CourtControllerSecurityTests.TestConfig.class
})
class CourtControllerSecurityTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private CourtService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        reset(service);
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/courts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listSucceedsWithJwt() throws Exception {
        when(service.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/courts").with(jwt()))
                .andExpect(status().isOk());
    }

    @Configuration
    @EnableWebMvc
    static class TestConfig {
        @Bean
        CourtService courtService() {
            return mock(CourtService.class);
        }

        @Bean
        JwtDecoder jwtDecoder() {
            return token -> {
                throw new UnsupportedOperationException("JWT decoding is bypassed by spring-security-test");
            };
        }
    }
}
