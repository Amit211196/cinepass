package com.capstone.cinepass.service;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.dto.CreateMovieRequest;
import com.capstone.cinepass.dto.MovieDetailResponse;
import com.capstone.cinepass.dto.MovieResponse;
import com.capstone.cinepass.dto.UpdateMovieRequest;

import java.util.List;

public interface MovieService {

    MovieResponse addMovie(CreateMovieRequest request);

    List<MovieResponse> getMovies(Genre genre);

    MovieDetailResponse getMovieDetails(Long id);

    MovieDetailResponse updateMovie(Long id, UpdateMovieRequest request);

    void deleteMovie(Long id);
}
