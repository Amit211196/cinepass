package com.capstone.cinepass.dto;

import com.capstone.cinepass.constant.Genre;

import java.time.LocalDate;
import java.util.UUID;

public record MovieResponse(UUID id, String title, Genre genre, LocalDate releaseDate) {
}
