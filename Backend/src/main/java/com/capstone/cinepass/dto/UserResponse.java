package com.capstone.cinepass.dto;

import java.util.UUID;

public record UserResponse(UUID id, String email, String name, boolean admin) {
}
