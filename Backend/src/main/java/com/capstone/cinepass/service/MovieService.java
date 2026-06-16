package com.capstone.cinepass.service;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.dto.CreateMovieRequest;
import com.capstone.cinepass.dto.MovieDetailResponse;
import com.capstone.cinepass.dto.MovieResponse;
import com.capstone.cinepass.dto.UpdateMovieRequest;

import java.util.List;
import java.util.UUID;

public interface MovieService {

    MovieResponse addMovie(CreateMovieRequest request);

    List<MovieResponse> getMovies(Genre genre);

    MovieDetailResponse getMovieDetails(UUID id);

    MovieDetailResponse updateMovie(UUID id, UpdateMovieRequest request);

    void deleteMovie(UUID id);
}
