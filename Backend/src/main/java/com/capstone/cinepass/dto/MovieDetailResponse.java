package com.capstone.cinepass.dto;

import com.capstone.cinepass.constant.Genre;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MovieDetailResponse(
        UUID id,
        String title,
        String description,
        Genre genre,
        LocalDate releaseDate,
        String posterUrl,
        String castText,
        Integer durationMins,
        String rating,
        List<ShowTimeResponse> showTimes
) {
}
