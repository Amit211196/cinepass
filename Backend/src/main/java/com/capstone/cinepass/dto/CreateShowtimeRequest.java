package com.capstone.cinepass.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateShowtimeRequest(
        UUID movieId,
        String theatreName,
        LocalDate showDate,
        LocalTime showTime,
        BigDecimal ticketPrice
) {
}
