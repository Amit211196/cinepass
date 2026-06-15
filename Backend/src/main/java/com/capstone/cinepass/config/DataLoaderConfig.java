package com.capstone.cinepass.config;

import com.capstone.cinepass.constant.Genre;
import com.capstone.cinepass.entity.Booking;
import com.capstone.cinepass.entity.BookingSeat;
import com.capstone.cinepass.entity.Movie;
import com.capstone.cinepass.entity.Showtime;
import com.capstone.cinepass.entity.User;
import com.capstone.cinepass.enums.BookingStatus;
import com.capstone.cinepass.repository.BookingRepository;
import com.capstone.cinepass.repository.BookingSeatRepository;
import com.capstone.cinepass.repository.MovieRepository;
import com.capstone.cinepass.repository.ShowtimeRepository;
import com.capstone.cinepass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Configuration
@Slf4j
public class DataLoaderConfig {

    @Bean
    CommandLineRunner loadData(
            UserRepository userRepository,
            MovieRepository movieRepository,
            ShowtimeRepository showtimeRepository,
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Only load data if database is empty
            if (userRepository.count() == 0) {
                log.info("Loading initial data into database...");

                // 1. Create Users
                List<User> users = new ArrayList<>();
                users.add(new User("admin@cinepass.com", passwordEncoder.encode("admin123"), "Admin User", true));
                users.add(new User("john@cinepass.com", passwordEncoder.encode("john123"), "John Doe", false));
                users.add(new User("jane@cinepass.com", passwordEncoder.encode("jane123"), "Jane Smith", false));
                List<User> savedUsers = userRepository.saveAll(users);
                log.info("Created {} users", savedUsers.size());

                // 2. Create Movies
                List<Movie> movies = new ArrayList<>();
                movies.add(new Movie("Interstellar", "A team of explorers travel through a wormhole in space", Genre.SCI_FI, LocalDate.of(2014, 11, 7), true));
                movies.add(new Movie("The Lion King", "A young lion prince flees his kingdom after his father's death", Genre.DRAMA, LocalDate.of(2019, 7, 9), true));
                movies.add(new Movie("Inception", "A thief who steals corporate secrets through dream-sharing technology", Genre.SCI_FI, LocalDate.of(2010, 7, 16), true));
                movies.add(new Movie("The Dark Knight", "Batman must accept psychological and physical tests to fight injustice", Genre.ACTION, LocalDate.of(2008, 7, 18), true));
                movies.add(new Movie("Avatar: The Way of Water", "Jake Sully and family on the planet Pandora facing familiar threats", Genre.ACTION, LocalDate.of(2022, 12, 16), true));
                movies.add(new Movie("Spirited Away", "A girl enters a magical world of gods, witches and spirits", Genre.DRAMA, LocalDate.of(2001, 7, 20), true));
                List<Movie> savedMovies = movieRepository.saveAll(movies);
                log.info("Created {} movies", savedMovies.size());

                // 3. Create Showtimes
                List<Showtime> showtimes = new ArrayList<>();
                LocalDate tomorrow = LocalDate.now().plusDays(1);
                LocalDate dayAfter = LocalDate.now().plusDays(2);
                LocalDate threeDaysLater = LocalDate.now().plusDays(3);

                // Interstellar showtimes
                showtimes.add(Showtime.builder().movieId(savedMovies.get(0).getId()).theatreName("PVR Cinemas").showDate(tomorrow).showTime(LocalTime.of(18, 30)).ticketPrice(new BigDecimal("250.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(0).getId()).theatreName("INOX Multiplex").showDate(dayAfter).showTime(LocalTime.of(21, 0)).ticketPrice(new BigDecimal("280.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(0).getId()).theatreName("Cinepolis").showDate(threeDaysLater).showTime(LocalTime.of(14, 0)).ticketPrice(new BigDecimal("220.00")).build());

                // The Lion King showtimes
                showtimes.add(Showtime.builder().movieId(savedMovies.get(1).getId()).theatreName("INOX Multiplex").showDate(tomorrow).showTime(LocalTime.of(15, 0)).ticketPrice(new BigDecimal("200.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(1).getId()).theatreName("Cinepolis").showDate(dayAfter).showTime(LocalTime.of(11, 30)).ticketPrice(new BigDecimal("180.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(1).getId()).theatreName("PVR Cinemas").showDate(threeDaysLater).showTime(LocalTime.of(19, 0)).ticketPrice(new BigDecimal("210.00")).build());

                // Inception showtimes
                showtimes.add(Showtime.builder().movieId(savedMovies.get(2).getId()).theatreName("PVR Cinemas").showDate(tomorrow).showTime(LocalTime.of(20, 45)).ticketPrice(new BigDecimal("250.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(2).getId()).theatreName("INOX Multiplex").showDate(dayAfter).showTime(LocalTime.of(16, 30)).ticketPrice(new BigDecimal("240.00")).build());

                // The Dark Knight showtimes
                showtimes.add(Showtime.builder().movieId(savedMovies.get(3).getId()).theatreName("Cinepolis IMAX").showDate(tomorrow).showTime(LocalTime.of(17, 15)).ticketPrice(new BigDecimal("350.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(3).getId()).theatreName("PVR IMAX").showDate(dayAfter).showTime(LocalTime.of(20, 0)).ticketPrice(new BigDecimal("340.00")).build());

                // Avatar showtimes
                showtimes.add(Showtime.builder().movieId(savedMovies.get(4).getId()).theatreName("PVR IMAX").showDate(threeDaysLater).showTime(LocalTime.of(14, 0)).ticketPrice(new BigDecimal("320.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(4).getId()).theatreName("INOX IMAX").showDate(LocalDate.now().plusDays(4)).showTime(LocalTime.of(18, 30)).ticketPrice(new BigDecimal("300.00")).build());

                // Spirited Away showtimes
                showtimes.add(Showtime.builder().movieId(savedMovies.get(5).getId()).theatreName("INOX Multiplex").showDate(tomorrow).showTime(LocalTime.of(12, 0)).ticketPrice(new BigDecimal("190.00")).build());
                showtimes.add(Showtime.builder().movieId(savedMovies.get(5).getId()).theatreName("Cinepolis").showDate(dayAfter).showTime(LocalTime.of(13, 0)).ticketPrice(new BigDecimal("185.00")).build());

                List<Showtime> savedShowtimes = showtimeRepository.saveAll(showtimes);
                log.info("Created {} showtimes", savedShowtimes.size());

                // 4. Create Sample Bookings with Seats
                Booking booking1 = Booking.builder()
                        .user(savedUsers.get(1))
                        .showtime(savedShowtimes.get(0))
                        .totalPrice(new BigDecimal("500.00"))
                        .status(BookingStatus.CONFIRMED)
                        .bookedAt(OffsetDateTime.now())
                        .build();
                booking1.addSeat("A4");
                booking1.addSeat("A5");

                Booking booking2 = Booking.builder()
                        .user(savedUsers.get(2))
                        .showtime(savedShowtimes.get(3))
                        .totalPrice(new BigDecimal("200.00"))
                        .status(BookingStatus.CONFIRMED)
                        .bookedAt(OffsetDateTime.now())
                        .build();
                booking2.addSeat("C5");

                List<Booking> savedBookings = bookingRepository.saveAll(List.of(booking1, booking2));
                log.info("Created {} bookings with {} seats", savedBookings.size(), bookingSeatRepository.count());

                log.info("Data loading completed successfully!");
                log.info("========================================");
                log.info("TEST ACCOUNTS:");
                log.info("Admin: admin@cinepass.com / admin123");
                log.info("User1: john@cinepass.com / john123");
                log.info("User2: jane@cinepass.com / jane123");
                log.info("========================================");
            } else {
                log.info("Database already contains data, skipping data load");
            }
        };
    }
}
