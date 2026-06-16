package com.capstone.cinepass.dto.booking;

import com.capstone.cinepass.enums.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

@Schema(description = "Booking details returned to clients")
public record BookingResponse(
        Long id,
        Long userId,
        Long showtimeId,
        BookingStatus status,
        BigDecimal totalPrice,
        List<String> seatCodes,
        OffsetDateTime bookedAt,
        OffsetDateTime cancelledAt,
        String movieTitle,
        String theatreName,
        LocalDate showDate,
        LocalTime showTime,
        String customerName,
        String customerEmail
) {
}
