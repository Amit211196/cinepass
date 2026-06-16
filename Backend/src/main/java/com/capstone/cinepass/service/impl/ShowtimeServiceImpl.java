package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.CreateShowtimeRequest;
import com.capstone.cinepass.dto.ShowTimeResponse;
import com.capstone.cinepass.entity.Showtime;
import com.capstone.cinepass.repository.ShowtimeRepository;
import com.capstone.cinepass.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;

    @Override
    public ShowTimeResponse createShowtime(CreateShowtimeRequest request) {
        Showtime showtime = new Showtime(
                request.movieId(),
                request.theatreName(),
                request.showDate(),
                request.showTime(),
                request.ticketPrice()
        );

        Showtime savedShowtime = showtimeRepository.save(showtime);
        return toResponse(savedShowtime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowTimeResponse> getShowtimesByMovie(Long movieId) {
        return showtimeRepository.findByMovieIdOrderByShowDateAscShowTimeAsc(movieId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        showtimeRepository.delete(showtime);
    }

    private ShowTimeResponse toResponse(Showtime showtime) {
        return new ShowTimeResponse(
                showtime.getId(),
                showtime.getMovieId(),
                showtime.getTheatreName(),
                showtime.getShowDate(),
                showtime.getShowTime(),
                showtime.getTicketPrice()
        );
    }
}

