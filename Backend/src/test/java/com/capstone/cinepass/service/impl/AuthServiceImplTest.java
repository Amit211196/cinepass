package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.AuthResponse;
import com.capstone.cinepass.dto.LoginRequest;
import com.capstone.cinepass.dto.RegisterRequest;
import com.capstone.cinepass.entity.User;
import com.capstone.cinepass.exception.BadRequestException;
import com.capstone.cinepass.exception.UnauthenticatedException;
import com.capstone.cinepass.repository.UserRepository;
import com.capstone.cinepass.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerCreatesUserAndReturnsAuthResponse() {
        RegisterRequest request = new RegisterRequest("Test User", "test@cinepass.com", "PlainPassword");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(jwtUtil.generateToken(request.email())).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo(request.email());
        assertThat(response.user().name()).isEqualTo(request.name());
        assertThat(response.user().isAdmin()).isFalse();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hashed-password");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Test User", "test@cinepass.com", "password");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("User with email already exists");

        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtil, never()).generateToken(any(String.class));
    }

    @Test
    void loginReturnsAuthResponseForValidCredentials() {
        LoginRequest request = new LoginRequest("test@cinepass.com", "password");
        User user = new User(request.email(), "hashed-password", "Test User", false);
        user.setId(UUID.randomUUID());

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(request.email())).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().id()).isEqualTo(user.getId());
        assertThat(response.user().email()).isEqualTo(user.getEmail());
    }

    @Test
    void loginRejectsUnknownEmail() {
        LoginRequest request = new LoginRequest("missing@cinepass.com", "password");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthenticatedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void loginRejectsInvalidPassword() {
        LoginRequest request = new LoginRequest("test@cinepass.com", "bad-password");
        User user = new User(request.email(), "hashed-password", "Test User", false);

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthenticatedException.class)
                .hasMessage("Invalid email or password");

        verify(jwtUtil, never()).generateToken(any(String.class));
    }
}

