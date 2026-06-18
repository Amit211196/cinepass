package com.capstone.cinepass.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private JwtUtil jwtUtilWithTestConfig() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=");
        ReflectionTestUtils.setField(jwtUtil, "expirationTimeMS", 60_000L);
        return jwtUtil;
    }

    @Test
    void generateTokenAndExtractEmailRoundTrip() {
        JwtUtil jwtUtil = jwtUtilWithTestConfig();

        String token = jwtUtil.generateToken("user@cinepass.com");

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("user@cinepass.com");
    }

    @Test
    void extractEmailRejectsMalformedToken() {
        JwtUtil jwtUtil = jwtUtilWithTestConfig();

        assertThatThrownBy(() -> jwtUtil.extractEmail("not-a-jwt"))
                .isInstanceOf(JwtException.class);
    }
}

