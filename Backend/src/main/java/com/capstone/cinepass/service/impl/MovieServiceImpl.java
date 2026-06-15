package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.dto.CreateMovieRequest;
import com.capstone.cinepass.dto.MovieDetailResponse;
import com.capstone.cinepass.dto.MovieResponse;
import com.capstone.cinepass.dto.UpdateMovieRequest;
import com.capstone.cinepass.entity.Movie;
import com.capstone.cinepass.repository.MovieRepository;
import com.capstone.cinepass.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    public MovieResponse addMovie(CreateMovieRequest request) {
        Movie movie = new Movie(request.title(), request.description(), request.genre(), request.releaseDate(), true);
        Movie savedMovie = movieRepository.save(movie);

        return getMovieResponseFromMovie(savedMovie);
    }

    @Override
    public List<MovieResponse> getMovies(Genre genre) {
        List<Movie> movies;

        if (genre == null) {
            movies = movieRepository.findByActiveTrue();
        } else {
            movies = movieRepository.findByGenreAndActiveTrue(genre);
        }

        return movies.stream().map(this::getMovieResponseFromMovie).toList();
    }

    @Override
    public MovieDetailResponse getMovieDetails(Long id) {
        Movie movie = movieRepository.findById(id).orElseThrow();

        return getMovieDetailResponseFromMovie(movie);
    }

    @Override
    public MovieDetailResponse updateMovie(Long id, UpdateMovieRequest request) {
        Movie movie = movieRepository.findById(id).orElseThrow();

        movie.setTitle(request.title());
        movie.setDescription(request.description());
        movie.setGenre(request.genre());
        movie.setReleaseDate(request.releaseDate());

        return getMovieDetailResponseFromMovie(movieRepository.save(movie));
    }

    @Override
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id).orElseThrow();

        movie.setActive(false);
        movieRepository.save(movie);
    }

    private MovieResponse getMovieResponseFromMovie(Movie movie) {
        return new MovieResponse(movie.getId(), movie.getTitle(), movie.getGenre(), movie.getReleaseDate());
    }

    private MovieDetailResponse getMovieDetailResponseFromMovie(Movie movie) {
        return new MovieDetailResponse(movie.getId(), movie.getTitle(), movie.getDescription(),
                movie.getGenre(), movie.getReleaseDate(), List.of());
    }
}
