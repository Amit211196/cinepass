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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BookingRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Test
    void findByUserIdOrderByBookedAtDescReturnsNewestFirst() {
        User user = userRepository.save(new User("user@cinepass.com", "hashed", "User", false));
        Showtime showtime = saveShowtime();

        Booking older = bookingRepository.save(booking(user, showtime, OffsetDateTime.now().minusDays(1)));
        Booking newer = bookingRepository.save(booking(user, showtime, OffsetDateTime.now()));

        List<Booking> results = bookingRepository.findByUser_IdOrderByBookedAtDesc(user.getId());

        assertThat(results).extracting(Booking::getId).containsSequence(newer.getId(), older.getId());
    }

    @Test
    void findWithDetailsByIdReturnsBookingWhenPresent() {
        User user = userRepository.save(new User("user2@cinepass.com", "hashed", "User 2", false));
        Showtime showtime = saveShowtime();
        Booking booking = bookingRepository.save(booking(user, showtime, OffsetDateTime.now()));
        booking.addSeat("A1");
        bookingRepository.save(booking);

        Optional<Booking> result = bookingRepository.findWithDetailsById(booking.getId());

        assertThat(result).isPresent();
        assertThat(result.orElseThrow().getSeats()).hasSize(1);
    }

    @Test
    void findByShowtimeIdReturnsOnlyMatchingShowtimeBookings() {
        User user = userRepository.save(new User("user3@cinepass.com", "hashed", "User 3", false));
        Showtime target = saveShowtime();
        Showtime other = saveShowtime();

        Booking targetBooking = bookingRepository.save(booking(user, target, OffsetDateTime.now()));
        bookingRepository.save(booking(user, other, OffsetDateTime.now()));

        List<Booking> results = bookingRepository.findByShowtimeId(target.getId());

        assertThat(results).extracting(Booking::getId).containsExactly(targetBooking.getId());
    }

    private Showtime saveShowtime() {
        return showtimeRepository.save(Showtime.builder()
                .movieId(UUID.randomUUID())
                .theatreName("PVR")
                .showDate(LocalDate.now().plusDays(1))
                .showTime(LocalTime.of(18, 30))
                .ticketPrice(new BigDecimal("250.00"))
                .build());
    }

    private Booking booking(User user, Showtime showtime, OffsetDateTime bookedAt) {
        return Booking.builder()
                .user(user)
                .showtime(showtime)
                .status(BookingStatus.CONFIRMED)
                .bookedAt(bookedAt)
                .totalPrice(new BigDecimal("250.00"))
                .build();
    }
}



