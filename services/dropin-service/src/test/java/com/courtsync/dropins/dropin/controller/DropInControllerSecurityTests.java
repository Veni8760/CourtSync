package com.courtsync.dropins.dropin.controller;

import com.courtsync.dropins.config.SecurityConfig;
import com.courtsync.dropins.dropin.service.DropInService;
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
 * Verifies the resource-server filter chain: drop-in endpoints reject anonymous
 * requests (401) and accept a valid JWT. JWT decoding itself is bypassed by
 * spring-security-test, so no real Supabase token is needed.
 */
@SpringJUnitWebConfig(classes = {
        DropInController.class,
        SecurityConfig.class,
        DropInControllerSecurityTests.TestConfig.class
})
class DropInControllerSecurityTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private DropInService service;

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
        mockMvc.perform(get("/drop-ins"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listSucceedsWithJwt() throws Exception {
        when(service.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/drop-ins").with(jwt()))
                .andExpect(status().isOk());
    }

    @Configuration
    @EnableWebMvc
    static class TestConfig {
        @Bean
        DropInService dropInService() {
            return mock(DropInService.class);
        }

        @Bean
        JwtDecoder jwtDecoder() {
            return token -> {
                throw new UnsupportedOperationException("JWT decoding is bypassed by spring-security-test");
            };
        }
    }
}
