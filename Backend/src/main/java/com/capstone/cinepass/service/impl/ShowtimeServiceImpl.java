package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.CreateShowtimeRequest;
import com.capstone.cinepass.dto.ShowTimeResponse;
import com.capstone.cinepass.entity.Showtime;
import com.capstone.cinepass.repository.ShowtimeRepository;
import com.capstone.cinepass.service.ShowtimeService;
import com.capstone.cinepass.entity.Booking;
import com.capstone.cinepass.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final BookingRepository bookingRepository;

    @Override
    public ShowTimeResponse createShowtime(CreateShowtimeRequest request) {
        Showtime showtime = Showtime.builder()
                .movieId(request.movieId())
                .theatreName(request.theatreName())
                .showDate(request.showDate())
                .showTime(request.showTime())
                .ticketPrice(request.ticketPrice())
                .build();

        Showtime savedShowtime = showtimeRepository.save(showtime);
        return toResponse(savedShowtime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowTimeResponse> getShowtimesByMovie(UUID movieId) {
        return showtimeRepository.findByMovieIdOrderByShowDateAscShowTimeAsc(movieId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ShowTimeResponse updateShowtime(UUID showtimeId, com.capstone.cinepass.dto.UpdateShowtimeRequest request) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        showtime.setMovieId(request.movieId());
        showtime.setTheatreName(request.theatreName());
        showtime.setShowDate(request.showDate());
        showtime.setShowTime(request.showTime());
        showtime.setTicketPrice(request.ticketPrice());
        Showtime updatedShowtime = showtimeRepository.save(showtime);
        return toResponse(updatedShowtime);
    }

    @Override
    public void deleteShowtime(UUID showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        List<Booking> bookings = bookingRepository.findByShowtimeId(showtimeId);
        bookingRepository.deleteAll(bookings);
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

