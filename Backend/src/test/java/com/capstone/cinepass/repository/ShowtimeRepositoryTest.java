package com.capstone.cinepass.repository;

import com.capstone.cinepass.entity.Showtime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ShowtimeRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Test
    void findByMovieIdOrderByShowDateAscShowTimeAscSortsChronologically() {
        UUID movieId = UUID.randomUUID();
        UUID otherMovieId = UUID.randomUUID();

        Showtime expectedThird = showtimeRepository.save(showtime(movieId, LocalDate.of(2026, 6, 20), LocalTime.of(20, 0)));
        Showtime expectedFirst = showtimeRepository.save(showtime(movieId, LocalDate.of(2026, 6, 19), LocalTime.of(18, 0)));
        Showtime expectedSecond = showtimeRepository.save(showtime(movieId, LocalDate.of(2026, 6, 19), LocalTime.of(21, 0)));
        showtimeRepository.save(showtime(otherMovieId, LocalDate.of(2026, 6, 18), LocalTime.of(10, 0)));

        List<Showtime> result = showtimeRepository.findByMovieIdOrderByShowDateAscShowTimeAsc(movieId);

        assertThat(result).extracting(Showtime::getId)
                .containsExactly(expectedFirst.getId(), expectedSecond.getId(), expectedThird.getId());
    }

    private Showtime showtime(UUID movieId, LocalDate date, LocalTime time) {
        return Showtime.builder()
                .movieId(movieId)
                .theatreName("PVR")
                .showDate(date)
                .showTime(time)
                .ticketPrice(new BigDecimal("199.00"))
                .build();
    }
}




