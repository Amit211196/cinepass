package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.dto.CreateMovieRequest;
import com.capstone.cinepass.dto.MovieDetailResponse;
import com.capstone.cinepass.dto.MovieResponse;
import com.capstone.cinepass.dto.UpdateMovieRequest;
import com.capstone.cinepass.entity.Movie;
import com.capstone.cinepass.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovieServiceImplTest {

    @Mock
    private MovieRepository movieRepository;

    @InjectMocks
    private MovieServiceImpl movieService;

    @Test
    void addMovieSavesEntityAndReturnsResponse() {
        CreateMovieRequest request = new CreateMovieRequest(
                "Interstellar",
                "Space drama",
                Genre.SCI_FI,
                LocalDate.of(2014, 11, 7),
                "poster.png",
                "Matthew McConaughey",
                169,
                "U/A"
        );

        UUID movieId = UUID.randomUUID();
        when(movieRepository.save(any(Movie.class))).thenAnswer(invocation -> {
            Movie movie = invocation.getArgument(0);
            movie.setId(movieId);
            return movie;
        });

        MovieResponse response = movieService.addMovie(request);

        assertThat(response.id()).isEqualTo(movieId);
        assertThat(response.title()).isEqualTo("Interstellar");
        assertThat(response.genre()).isEqualTo(Genre.SCI_FI);

        ArgumentCaptor<Movie> movieCaptor = ArgumentCaptor.forClass(Movie.class);
        verify(movieRepository).save(movieCaptor.capture());
        assertThat(movieCaptor.getValue().isActive()).isTrue();
        assertThat(movieCaptor.getValue().getCastText()).isEqualTo("Matthew McConaughey");
    }

    @Test
    void getMoviesWithoutGenreUsesActiveFilter() {
        Movie activeMovie = new Movie("Movie A", "Desc", Genre.ACTION, LocalDate.now(), true, "a.png");
        activeMovie.setId(UUID.randomUUID());
        when(movieRepository.findByActiveTrue()).thenReturn(List.of(activeMovie));

        List<MovieResponse> responses = movieService.getMovies(null);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().id()).isEqualTo(activeMovie.getId());
        verify(movieRepository).findByActiveTrue();
    }

    @Test
    void getMoviesWithGenreUsesGenreAndActiveFilter() {
        Movie activeMovie = new Movie("Movie A", "Desc", Genre.ACTION, LocalDate.now(), true, "a.png");
        activeMovie.setId(UUID.randomUUID());
        when(movieRepository.findByGenreAndActiveTrue(Genre.ACTION)).thenReturn(List.of(activeMovie));

        List<MovieResponse> responses = movieService.getMovies(Genre.ACTION);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().genre()).isEqualTo(Genre.ACTION);
        verify(movieRepository).findByGenreAndActiveTrue(Genre.ACTION);
    }

    @Test
    void updateMovieUpdatesExistingEntityFields() {
        UUID movieId = UUID.randomUUID();
        Movie existing = new Movie("Old", "Old desc", Genre.DRAMA, LocalDate.of(2010, 1, 1), true, "old.png");
        existing.setId(movieId);

        UpdateMovieRequest request = new UpdateMovieRequest(
                "New Title",
                "New desc",
                Genre.THRILLER,
                LocalDate.of(2020, 5, 1),
                "new.png",
                "New Cast",
                150,
                "A"
        );

        when(movieRepository.findById(movieId)).thenReturn(Optional.of(existing));
        when(movieRepository.save(existing)).thenReturn(existing);

        MovieDetailResponse response = movieService.updateMovie(movieId, request);

        assertThat(response.title()).isEqualTo("New Title");
        assertThat(response.genre()).isEqualTo(Genre.THRILLER);
        assertThat(existing.getDurationMins()).isEqualTo(150);
        verify(movieRepository).save(existing);
    }

    @Test
    void deleteMovieMarksMovieInactive() {
        UUID movieId = UUID.randomUUID();
        Movie existing = new Movie("Title", "Desc", Genre.COMEDY, LocalDate.now(), true, "p.png");

        when(movieRepository.findById(movieId)).thenReturn(Optional.of(existing));

        movieService.deleteMovie(movieId);

        assertThat(existing.isActive()).isFalse();
        verify(movieRepository).save(existing);
    }

    @Test
    void getMovieDetailsThrowsWhenMovieIsMissing() {
        UUID movieId = UUID.randomUUID();
        when(movieRepository.findById(movieId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> movieService.getMovieDetails(movieId))
                .isInstanceOf(java.util.NoSuchElementException.class);
    }
}

