package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.AuthResponse;
import com.capstone.cinepass.dto.LoginRequest;
import com.capstone.cinepass.dto.RegisterRequest;
import com.capstone.cinepass.dto.UserResponse;
import com.capstone.cinepass.entity.User;
import com.capstone.cinepass.repository.UserRepository;
import com.capstone.cinepass.security.JwtUtil;
import com.capstone.cinepass.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new com.capstone.cinepass.exception.BadRequestException("User with email already exists");
        }

        User user = new User(registerRequest.email(), passwordEncoder.encode(registerRequest.password()),
                registerRequest.name(), false);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        UserResponse userResponse = new UserResponse(user.getId(), user.getEmail(), user.getName(), user.isAdmin());
        return new AuthResponse(token, userResponse);
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new com.capstone.cinepass.exception.UnauthenticatedException("Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            throw new com.capstone.cinepass.exception.UnauthenticatedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        UserResponse userResponse = new UserResponse(user.getId(), user.getEmail(), user.getName(), user.isAdmin());

        return new AuthResponse(token, userResponse);
    }
}
