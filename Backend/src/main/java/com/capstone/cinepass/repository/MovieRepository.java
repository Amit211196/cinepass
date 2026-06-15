package com.capstone.cinepass.repository;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MovieRepository extends JpaRepository<Movie, UUID> {

    List<Movie> findByActiveTrue();

    List<Movie> findByGenreAndActiveTrue(Genre genre);
}
