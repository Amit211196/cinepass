package com.capstone.cinepass.repository;

import com.capstone.cinepass.entity.Booking;
import com.capstone.cinepass.entity.Showtime;
import com.capstone.cinepass.entity.User;
import com.capstone.cinepass.enums.BookingStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BookingSeatRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Test
    void findSeatCodesByShowtimeIdAndBookingStatusReturnsSortedConfirmedSeats() {
        User user = userRepository.save(new User("seats@cinepass.com", "hashed", "Seats User", false));
        Showtime showtime = saveShowtime();

        Booking confirmed = bookingRepository.save(booking(user, showtime, BookingStatus.CONFIRMED));
        confirmed.addSeat("C3");
        confirmed.addSeat("A1");
        bookingRepository.save(confirmed);

        Booking cancelled = bookingRepository.save(booking(user, showtime, BookingStatus.CANCELLED));
        cancelled.addSeat("B2");
        bookingRepository.save(cancelled);

        List<String> seats = bookingSeatRepository.findSeatCodesByShowtimeIdAndBookingStatus(
                showtime.getId(),
                BookingStatus.CONFIRMED
        );

        assertThat(seats).containsExactly("A1", "C3");
    }

    @Test
    void findConflictingSeatCodesReturnsOnlyMatchingRequestedSeats() {
        User user = userRepository.save(new User("conflict@cinepass.com", "hashed", "Conflict User", false));
        Showtime showtime = saveShowtime();

        Booking booking = bookingRepository.save(booking(user, showtime, BookingStatus.CONFIRMED));
        booking.addSeat("A1");
        booking.addSeat("A2");
        bookingRepository.save(booking);

        List<String> conflicts = bookingSeatRepository.findConflictingSeatCodes(
                showtime.getId(),
                BookingStatus.CONFIRMED,
                List.of("A2", "A3")
        );

        assertThat(conflicts).containsExactly("A2");
    }

    private Showtime saveShowtime() {
        return showtimeRepository.save(Showtime.builder()
                .movieId(UUID.randomUUID())
                .theatreName("INOX")
                .showDate(LocalDate.now().plusDays(1))
                .showTime(LocalTime.of(20, 0))
                .ticketPrice(new BigDecimal("300.00"))
                .build());
    }

    private Booking booking(User user, Showtime showtime, BookingStatus status) {
        return Booking.builder()
                .user(user)
                .showtime(showtime)
                .status(status)
                .bookedAt(OffsetDateTime.now())
                .totalPrice(new BigDecimal("300.00"))
                .build();
    }
}



