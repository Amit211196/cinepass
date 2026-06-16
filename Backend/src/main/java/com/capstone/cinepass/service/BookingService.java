package com.capstone.cinepass.service;

import com.capstone.cinepass.dto.booking.BookingResponse;
import com.capstone.cinepass.dto.booking.CancelBookingResponse;
import com.capstone.cinepass.dto.booking.CreateBookingRequest;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    List<String> getBookedSeats(Long showtimeId);

    List<BookingResponse> getMyBookings();

    CancelBookingResponse cancelBooking(Long bookingId);

    List<BookingResponse> getAllBookings();
}
