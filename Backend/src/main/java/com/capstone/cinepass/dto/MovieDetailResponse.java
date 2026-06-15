package com.capstone.cinepass.dto;

import com.capstone.cinepass.constant.Genre;

import java.time.LocalDate;
import java.util.List;

public record MovieDetailResponse(Long id, String title, String description, Genre genre, LocalDate releaseDate, int durationMins, String rating, String posterUrl, String synopsis, String castText, List<ShowTimeResponse> showTimes) {
}
