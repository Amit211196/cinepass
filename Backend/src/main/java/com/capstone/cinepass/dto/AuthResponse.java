package com.capstone.cinepass.dto;

public record AuthResponse(String token, String email, String name, boolean isAdmin) {
}
