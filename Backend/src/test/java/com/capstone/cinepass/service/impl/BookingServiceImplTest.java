package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.booking.BookingResponse;
import com.capstone.cinepass.dto.booking.CancelBookingResponse;
import com.capstone.cinepass.dto.booking.CreateBookingRequest;
import com.capstone.cinepass.entity.Booking;
import com.capstone.cinepass.entity.Showtime;
import com.capstone.cinepass.entity.User;
import com.capstone.cinepass.enums.BookingStatus;
import com.capstone.cinepass.exception.BadRequestException;
import com.capstone.cinepass.exception.ForbiddenException;
import com.capstone.cinepass.exception.ResourceNotFoundException;
import com.capstone.cinepass.exception.UnauthenticatedException;
import com.capstone.cinepass.repository.BookingRepository;
import com.capstone.cinepass.repository.BookingSeatRepository;
import com.capstone.cinepass.repository.ShowtimeRepository;
import com.capstone.cinepass.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    private static final String USER_EMAIL = "user@cinepass.com";

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User currentUser;
    private Showtime showtime;

    @BeforeEach
    void setUp() {
        currentUser = new User(USER_EMAIL, "hashed-password", "Test User", false);
        ReflectionTestUtils.setField(currentUser, "id", 1L);

        showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .movieId(UUID.randomUUID())
                .theatreName("PVR Cinemas")
                .showDate(LocalDate.now().plusDays(1))
                .showTime(LocalTime.of(18, 30))
                .ticketPrice(new BigDecimal("250.00"))
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createBookingCreatesConfirmedBookingWhenSeatsAreAvailable() {
        authenticate(USER_EMAIL);
        CreateBookingRequest request = new CreateBookingRequest(showtime.getId(), List.of(" a1 ", "a2"));
        UUID bookingId = UUID.randomUUID();

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(showtimeRepository.findById(showtime.getId())).thenReturn(Optional.of(showtime));
        when(bookingSeatRepository.findConflictingSeatCodes(
                showtime.getId(),
                BookingStatus.CONFIRMED,
                List.of("A1", "A2")
        )).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(bookingId);
            return booking;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertThat(response.id()).isEqualTo(bookingId);
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.showtimeId()).isEqualTo(showtime.getId());
        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.totalPrice()).isEqualByComparingTo("500.00");
        assertThat(response.seatCodes()).containsExactly("A1", "A2");

        ArgumentCaptor<Booking> bookingCaptor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(bookingCaptor.capture());
        assertThat(bookingCaptor.getValue().getSeats()).hasSize(2);
    }

    @Test
    void createBookingRejectsUnauthenticatedUser() {
        CreateBookingRequest request = new CreateBookingRequest(showtime.getId(), List.of("A1"));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(UnauthenticatedException.class)
                .hasMessage("User must be authenticated");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingRejectsUnknownShowtime() {
        authenticate(USER_EMAIL);
        CreateBookingRequest request = new CreateBookingRequest(showtime.getId(), List.of("A1"));

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(showtimeRepository.findById(showtime.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Showtime not found");
    }

    @Test
    void createBookingRejectsEmptySeatList() {
        authenticate(USER_EMAIL);
        CreateBookingRequest request = new CreateBookingRequest(showtime.getId(), List.of());

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(showtimeRepository.findById(showtime.getId())).thenReturn(Optional.of(showtime));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Seat list cannot be null or empty");
    }

    @Test
    void createBookingRejectsMoreThanSixSeats() {
        authenticate(USER_EMAIL);
        CreateBookingRequest request = new CreateBookingRequest(
                showtime.getId(),
                List.of("A1", "A2", "A3", "A4", "A5", "A6", "A7")
        );

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(showtimeRepository.findById(showtime.getId())).thenReturn(Optional.of(showtime));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("A maximum of 6 seats can be booked at once");
    }

    @Test
    void createBookingRejectsDuplicateSeatsAfterNormalization() {
        authenticate(USER_EMAIL);
        CreateBookingRequest request = new CreateBookingRequest(showtime.getId(), List.of("A1", " a1 "));

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(showtimeRepository.findById(showtime.getId())).thenReturn(Optional.of(showtime));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Duplicate seats in request are not allowed");
    }

    @Test
    void createBookingRejectsAlreadyBookedSeats() {
        authenticate(USER_EMAIL);
        CreateBookingRequest request = new CreateBookingRequest(showtime.getId(), List.of("A1", "A2"));

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(showtimeRepository.findById(showtime.getId())).thenReturn(Optional.of(showtime));
        when(bookingSeatRepository.findConflictingSeatCodes(
                showtime.getId(),
                BookingStatus.CONFIRMED,
                List.of("A1", "A2")
        )).thenReturn(List.of("A2"));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Seats already booked: A2");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void getBookedSeatsReturnsConfirmedSeatsOnly() {
        UUID showtimeId = showtime.getId();

        when(showtimeRepository.existsById(showtimeId)).thenReturn(true);
        when(bookingSeatRepository.findSeatCodesByShowtimeIdAndBookingStatus(
                showtimeId,
                BookingStatus.CONFIRMED
        )).thenReturn(List.of("A1", "B2"));

        List<String> seats = bookingService.getBookedSeats(showtimeId);

        assertThat(seats).containsExactly("A1", "B2");
    }

    @Test
    void getBookedSeatsRejectsUnknownShowtime() {
        UUID showtimeId = showtime.getId();
        when(showtimeRepository.existsById(showtimeId)).thenReturn(false);

        assertThatThrownBy(() -> bookingService.getBookedSeats(showtimeId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Showtime not found");
    }

    @Test
    void getMyBookingsReturnsRepositoryOrder() {
        authenticate(USER_EMAIL);
        Booking newer = bookingWith(currentUser, showtime, BookingStatus.CONFIRMED, OffsetDateTime.now());
        Booking older = bookingWith(currentUser, showtime, BookingStatus.CONFIRMED, OffsetDateTime.now().minusDays(1));

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(bookingRepository.findByUser_IdOrderByBookedAtDesc(currentUser.getId())).thenReturn(List.of(newer, older));

        List<BookingResponse> responses = bookingService.getMyBookings();

        assertThat(responses).extracting(BookingResponse::id)
                .containsExactly(newer.getId(), older.getId());
        verify(bookingRepository).findByUser_IdOrderByBookedAtDesc(currentUser.getId());
    }

    @Test
    void cancelBookingChangesStatusToCancelled() {
        authenticate(USER_EMAIL);
        Booking booking = bookingWith(currentUser, showtime, BookingStatus.CONFIRMED, OffsetDateTime.now());

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(bookingRepository.findWithDetailsById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        CancelBookingResponse response = bookingService.cancelBooking(booking.getId());

        assertThat(response.bookingId()).isEqualTo(booking.getId());
        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.cancelledAt()).isNotNull();
        assertThat(response.message()).isEqualTo("Booking cancelled successfully");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void cancelBookingRejectsUnknownBooking() {
        authenticate(USER_EMAIL);
        UUID bookingId = UUID.randomUUID();

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(bookingRepository.findWithDetailsById(bookingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Booking not found");
    }

    @Test
    void cancelBookingRejectsOtherUsersBooking() {
        authenticate(USER_EMAIL);
        User otherUser = new User("other@cinepass.com", "hashed-password", "Other User", false);
        ReflectionTestUtils.setField(otherUser, "id", 2L);
        Booking booking = bookingWith(otherUser, showtime, BookingStatus.CONFIRMED, OffsetDateTime.now());

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(bookingRepository.findWithDetailsById(booking.getId())).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("You can cancel only your own bookings");
    }

    @Test
    void cancelBookingRejectsAlreadyCancelledBooking() {
        authenticate(USER_EMAIL);
        Booking booking = bookingWith(currentUser, showtime, BookingStatus.CANCELLED, OffsetDateTime.now());

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(currentUser));
        when(bookingRepository.findWithDetailsById(booking.getId())).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getId()))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Booking is already cancelled");
    }

    private void authenticate(String email) {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(email, null);
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private Booking bookingWith(User user, Showtime showtime, BookingStatus status, OffsetDateTime bookedAt) {
        Booking booking = Booking.builder()
                .id(UUID.randomUUID())
                .user(user)
                .showtime(showtime)
                .status(status)
                .bookedAt(bookedAt)
                .totalPrice(new BigDecimal("250.00"))
                .build();
        booking.addSeat("A1");
        return booking;
    }
}
