package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.CreateShowtimeRequest;
import com.capstone.cinepass.dto.ShowTimeResponse;
import com.capstone.cinepass.dto.UpdateShowtimeRequest;
import com.capstone.cinepass.entity.Booking;
import com.capstone.cinepass.entity.Showtime;
import com.capstone.cinepass.repository.BookingRepository;
import com.capstone.cinepass.repository.ShowtimeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShowtimeServiceImplTest {

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ShowtimeServiceImpl showtimeService;

    @Test
    void createShowtimePersistsAndMapsResponse() {
        UUID movieId = UUID.randomUUID();
        CreateShowtimeRequest request = new CreateShowtimeRequest(
                movieId,
                "PVR",
                LocalDate.now().plusDays(1),
                LocalTime.of(18, 30),
                new BigDecimal("350.00")
        );

        UUID showtimeId = UUID.randomUUID();
        when(showtimeRepository.save(any(Showtime.class))).thenAnswer(invocation -> {
            Showtime showtime = invocation.getArgument(0);
            showtime.setId(showtimeId);
            return showtime;
        });

        ShowTimeResponse response = showtimeService.createShowtime(request);

        assertThat(response.id()).isEqualTo(showtimeId);
        assertThat(response.movieId()).isEqualTo(movieId);
        assertThat(response.theatreName()).isEqualTo("PVR");
    }

    @Test
    void getShowtimesByMovieMapsRepositoryResult() {
        UUID movieId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .movieId(movieId)
                .theatreName("INOX")
                .showDate(LocalDate.now().plusDays(2))
                .showTime(LocalTime.of(15, 0))
                .ticketPrice(new BigDecimal("220.00"))
                .build();

        when(showtimeRepository.findByMovieIdOrderByShowDateAscShowTimeAsc(movieId)).thenReturn(List.of(showtime));

        List<ShowTimeResponse> responses = showtimeService.getShowtimesByMovie(movieId);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().theatreName()).isEqualTo("INOX");
    }

    @Test
    void updateShowtimeUpdatesStoredEntity() {
        UUID showtimeId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(showtimeId)
                .movieId(UUID.randomUUID())
                .theatreName("Old")
                .showDate(LocalDate.now())
                .showTime(LocalTime.NOON)
                .ticketPrice(new BigDecimal("150.00"))
                .build();

        UpdateShowtimeRequest request = new UpdateShowtimeRequest(
                UUID.randomUUID(),
                "New Theatre",
                LocalDate.now().plusDays(1),
                LocalTime.of(21, 15),
                new BigDecimal("480.00")
        );

        when(showtimeRepository.findById(showtimeId)).thenReturn(Optional.of(showtime));
        when(showtimeRepository.save(showtime)).thenReturn(showtime);

        ShowTimeResponse response = showtimeService.updateShowtime(showtimeId, request);

        assertThat(response.theatreName()).isEqualTo("New Theatre");
        assertThat(showtime.getTicketPrice()).isEqualByComparingTo("480.00");
    }

    @Test
    void updateShowtimeThrowsWhenIdDoesNotExist() {
        UUID showtimeId = UUID.randomUUID();
        UpdateShowtimeRequest request = new UpdateShowtimeRequest(
                UUID.randomUUID(),
                "Theatre",
                LocalDate.now(),
                LocalTime.NOON,
                new BigDecimal("100.00")
        );

        when(showtimeRepository.findById(showtimeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> showtimeService.updateShowtime(showtimeId, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Showtime not found");
    }

    @Test
    void deleteShowtimeRemovesBookingsThenShowtime() {
        UUID showtimeId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(showtimeId)
                .movieId(UUID.randomUUID())
                .theatreName("PVR")
                .showDate(LocalDate.now())
                .showTime(LocalTime.NOON)
                .ticketPrice(new BigDecimal("200.00"))
                .build();

        Booking booking = Booking.builder().id(UUID.randomUUID()).showtime(showtime).build();

        when(showtimeRepository.findById(showtimeId)).thenReturn(Optional.of(showtime));
        when(bookingRepository.findByShowtimeId(showtimeId)).thenReturn(List.of(booking));

        showtimeService.deleteShowtime(showtimeId);

        verify(bookingRepository).deleteAll(List.of(booking));
        verify(showtimeRepository).delete(showtime);
    }
}

