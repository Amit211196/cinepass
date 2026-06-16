package com.capstone.cinepass.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ShowTimeResponse(
        Long id,
        Long movieId,
        String theatreName,
        LocalDate showDate,
        LocalTime showTime,
        BigDecimal ticketPrice
) {
}
