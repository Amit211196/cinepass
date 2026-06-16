package com.capstone.cinepass.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateShowtimeRequest(
        Long movieId,
        String theatreName,
        LocalDate showDate,
        LocalTime showTime,
        BigDecimal ticketPrice
) {
}
