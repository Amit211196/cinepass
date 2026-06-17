package com.capstone.cinepass.dto.booking;

import com.capstone.cinepass.enums.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Booking details returned to clients")
public record BookingResponse(
        UUID id,
        UUID userId,
        UUID showtimeId,
        BookingStatus status,
        BigDecimal totalPrice,
        List<String> seatCodes,
        OffsetDateTime bookedAt,
        OffsetDateTime cancelledAt,
        String movieTitle,
        String moviePoster,
        String theatreName,
        LocalDate showDate,
        LocalTime showTime,
        String customerName,
        String customerEmail
) {
}
