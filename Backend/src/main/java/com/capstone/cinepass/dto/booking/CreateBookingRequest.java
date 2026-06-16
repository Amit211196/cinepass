package com.capstone.cinepass.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Schema(description = "Payload for creating a booking")
public record CreateBookingRequest(
        @Schema(description = "Showtime identifier", example = "f6d88d9e-1a68-40dd-8f28-22d44c94f687")
        @NotNull(message = "Showtime id is required")
        UUID showtimeId,

        @Schema(description = "Seat codes to reserve", example = "[\"A1\", \"A2\"]")
        @NotEmpty(message = "Seat list cannot be empty")
        @Size(max = 6, message = "A maximum of 6 seats can be booked at once")
        List<@jakarta.validation.constraints.NotBlank(message = "Seat code cannot be blank") String> seatCodes
) {
}
