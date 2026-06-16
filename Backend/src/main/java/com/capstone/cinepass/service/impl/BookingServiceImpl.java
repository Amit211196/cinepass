package com.capstone.cinepass.service.impl;

import com.capstone.cinepass.dto.booking.BookingResponse;
import com.capstone.cinepass.dto.booking.CancelBookingResponse;
import com.capstone.cinepass.dto.booking.CreateBookingRequest;
import com.capstone.cinepass.entity.Booking;
import com.capstone.cinepass.entity.BookingSeat;
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
import com.capstone.cinepass.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final int MAX_SEATS_PER_BOOKING = 6;

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final UserRepository userRepository;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        User currentUser = getCurrentUser();
        Showtime showtime = showtimeRepository.findById(request.showtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
        List<String> seatCodes = validateAndNormalizeSeats(request.seatCodes());

        List<String> conflicts = bookingSeatRepository.findConflictingSeatCodes(
                showtime.getId(),
                BookingStatus.CONFIRMED,
                seatCodes
        );
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Seats already booked: " + String.join(", ", conflicts));
        }

        Booking booking = Booking.builder()
                .user(currentUser)
                .showtime(showtime)
                .status(BookingStatus.CONFIRMED)
                .bookedAt(OffsetDateTime.now())
                .totalPrice(showtime.getTicketPrice().multiply(BigDecimal.valueOf(seatCodes.size())))
                .build();
        seatCodes.forEach(booking::addSeat);

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getBookedSeats(UUID showtimeId) {
        if (!showtimeRepository.existsById(showtimeId)) {
            throw new ResourceNotFoundException("Showtime not found");
        }
        return bookingSeatRepository.findSeatCodesByShowtimeIdAndBookingStatus(
                showtimeId,
                BookingStatus.CONFIRMED
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByUser_IdOrderByBookedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CancelBookingResponse cancelBooking(UUID bookingId) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findWithDetailsById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can cancel only your own bookings");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.cancel();
        Booking savedBooking = bookingRepository.save(booking);
        return new CancelBookingResponse(
                savedBooking.getId(),
                savedBooking.getStatus(),
                savedBooking.getCancelledAt(),
                "Booking cancelled successfully"
        );
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new UnauthenticatedException("User must be authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthenticatedException("Authenticated user not found"));
    }

    private List<String> validateAndNormalizeSeats(List<String> rawSeatCodes) {
        if (rawSeatCodes == null || rawSeatCodes.isEmpty()) {
            throw new BadRequestException("Seat list cannot be null or empty");
        }
        if (rawSeatCodes.size() > MAX_SEATS_PER_BOOKING) {
            throw new BadRequestException("A maximum of 6 seats can be booked at once");
        }

        List<String> normalizedSeatCodes = rawSeatCodes.stream()
                .map(seat -> seat == null ? "" : seat.trim().toUpperCase(Locale.ROOT))
                .toList();

        if (normalizedSeatCodes.stream().anyMatch(String::isBlank)) {
            throw new BadRequestException("Seat code cannot be blank");
        }

        Set<String> uniqueSeats = new HashSet<>(normalizedSeatCodes);
        if (uniqueSeats.size() != normalizedSeatCodes.size()) {
            throw new BadRequestException("Duplicate seats in request are not allowed");
        }

        return normalizedSeatCodes;
    }

    private BookingResponse toResponse(Booking booking) {
        List<String> seatCodes = booking.getSeats()
                .stream()
                .map(BookingSeat::getSeatCode)
                .sorted()
                .toList();

        Showtime showtime = booking.getShowtime();
        User user = booking.getUser();

        return new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                booking.getShowtime().getId(),
                booking.getStatus(),
                booking.getTotalPrice(),
                seatCodes,
                booking.getBookedAt(),
                booking.getCancelledAt(),
                "", // movieTitle - will be fetched when needed
                showtime.getTheatreName(),
                showtime.getShowDate(),
                showtime.getShowTime(),
                user.getName(),
                user.getEmail()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
