package com.capstone.cinepass.service;

import com.capstone.cinepass.dto.booking.BookingResponse;
import com.capstone.cinepass.dto.booking.CancelBookingResponse;
import com.capstone.cinepass.dto.booking.CreateBookingRequest;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    List<String> getBookedSeats(UUID showtimeId);

    List<BookingResponse> getMyBookings();

    CancelBookingResponse cancelBooking(UUID bookingId);

    List<BookingResponse> getAllBookings();
}
