package com.capstone.cinepass.repository;

import com.capstone.cinepass.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieIdOrderByShowDateAscShowTimeAsc(Long movieId);
}
