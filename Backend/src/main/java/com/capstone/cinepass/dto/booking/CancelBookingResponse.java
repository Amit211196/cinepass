package com.capstone.cinepass.dto.booking;

import com.capstone.cinepass.enums.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Response returned after cancelling a booking")
public record CancelBookingResponse(
        Long bookingId,
        BookingStatus status,
        OffsetDateTime cancelledAt,
        String message
) {
}
