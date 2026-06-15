package com.capstone.cinepass.dto;

import com.capstone.cinepass.constant.Genre;

import java.time.LocalDate;

public record CreateMovieRequest(String title, String description, Genre genre, LocalDate releaseDate, int durationMins, String rating, String posterUrl, String synopsis, String castText) {
}
