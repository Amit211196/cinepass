package com.capstone.cinepass.service;

import com.capstone.cinepass.dto.AuthResponse;
import com.capstone.cinepass.dto.LoginRequest;
import com.capstone.cinepass.dto.RegisterRequest;

public interface AuthService {

    /**
     * Register new user
     *
     * @param registerRequest request object containing name, email and password
     * @return response object containing token
     */
    AuthResponse register(RegisterRequest registerRequest);

    /**
     * Validates user's credentials and provides token
     *
     * @param loginRequest request object containing email and password
     * @return response object containing token
     */
    AuthResponse login(LoginRequest loginRequest);
}
