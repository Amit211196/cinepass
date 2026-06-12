package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.AuthResponse;
import com.capstone.cinepass.dto.RegisterRequest;
import com.capstone.cinepass.entity.User;
import com.capstone.cinepass.repository.UserRepository;
import com.capstone.cinepass.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new RuntimeException("User with email already exists");
        }

        User user = new User(registerRequest.email(), passwordEncoder.encode(registerRequest.password()),
                registerRequest.name(), false);
        userRepository.save(user);

        // TODO: implement creation of JWT token and replace this dummy response with it
        return new AuthResponse("test token", "test refresh token");
    }
}
