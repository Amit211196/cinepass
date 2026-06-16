package com.capstone.cinepass.dto;

import com.capstone.cinepass.constant.Genre;

import java.time.LocalDate;

public record MovieResponse(Long id, String title, Genre genre, LocalDate releaseDate) {
}
