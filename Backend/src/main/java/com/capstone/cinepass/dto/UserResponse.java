package com.capstone.cinepass.dto;

public record UserResponse(Long id, String email, String name, boolean isAdmin) {
}
