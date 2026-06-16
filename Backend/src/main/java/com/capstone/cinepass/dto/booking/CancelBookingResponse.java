package com.capstone.cinepass.dto.booking;

import com.capstone.cinepass.enums.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Response returned after cancelling a booking")
public record CancelBookingResponse(
        UUID bookingId,
        BookingStatus status,
        OffsetDateTime cancelledAt,
        String message
) {
}
