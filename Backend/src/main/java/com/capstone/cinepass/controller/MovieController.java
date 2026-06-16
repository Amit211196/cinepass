package com.capstone.cinepass.controller;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.dto.CreateMovieRequest;
import com.capstone.cinepass.dto.MovieDetailResponse;
import com.capstone.cinepass.dto.MovieResponse;
import com.capstone.cinepass.dto.UpdateMovieRequest;
import com.capstone.cinepass.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public MovieResponse addMovie(@RequestBody CreateMovieRequest request) {
        return movieService.addMovie(request);
    }

    @GetMapping
    public List<MovieResponse> getMovies(@RequestParam(required = false) Genre genre) {
        return movieService.getMovies(genre);
    }

    @GetMapping("/{id}")
    public MovieDetailResponse getMovieDetails(@PathVariable Long id) {
        return movieService.getMovieDetails(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MovieDetailResponse updateMovie(@PathVariable Long id, @RequestBody UpdateMovieRequest request) {
        return movieService.updateMovie(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
    }
}
