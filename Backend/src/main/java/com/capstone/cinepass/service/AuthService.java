package com.capstone.cinepass.service;

import com.capstone.cinepass.dto.AuthResponse;
import com.capstone.cinepass.dto.RegisterRequest;

public interface AuthService {

    /**
     * Register new user
     *
     * @param registerRequest request object containing name, email and password
     * @return response object containing token and refresh token
     */
    AuthResponse register(RegisterRequest registerRequest);
}
