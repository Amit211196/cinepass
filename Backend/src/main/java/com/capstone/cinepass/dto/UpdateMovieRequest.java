package com.capstone.cinepass.dto;

import com.capstone.cinepass.constant.Genre;

import java.time.LocalDate;

public record UpdateMovieRequest(String title, String description, Genre genre, LocalDate releaseDate) {
}