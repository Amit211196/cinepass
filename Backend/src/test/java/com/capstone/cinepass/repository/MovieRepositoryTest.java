package com.capstone.cinepass.repository;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.entity.Movie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MovieRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private MovieRepository movieRepository;

    @Test
    void findByActiveTrueReturnsOnlyActiveMovies() {
        movieRepository.save(new Movie("Active", "desc", Genre.ACTION, LocalDate.now(), true, "a.png"));
        movieRepository.save(new Movie("Inactive", "desc", Genre.ACTION, LocalDate.now(), false, "b.png"));

        List<Movie> activeMovies = movieRepository.findByActiveTrue();

        assertThat(activeMovies).extracting(Movie::getTitle).contains("Active").doesNotContain("Inactive");
    }

    @Test
    void findByGenreAndActiveTrueFiltersByGenreAndStatus() {
        movieRepository.save(new Movie("Action Active", "desc", Genre.ACTION, LocalDate.now(), true, "a.png"));
        movieRepository.save(new Movie("Action Inactive", "desc", Genre.ACTION, LocalDate.now(), false, "b.png"));
        movieRepository.save(new Movie("Drama Active", "desc", Genre.DRAMA, LocalDate.now(), true, "c.png"));

        List<Movie> actionMovies = movieRepository.findByGenreAndActiveTrue(Genre.ACTION);

        assertThat(actionMovies).extracting(Movie::getTitle)
                .contains("Action Active")
                .doesNotContain("Action Inactive", "Drama Active");
    }
}




