package com.capstone.cinepass.repository;

import com.capstone.cinepass.enums.BookingStatus;
import com.capstone.cinepass.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, UUID> {

    @Query("""
            select bs.seatCode
            from BookingSeat bs
            where bs.showtime.id = :showtimeId
              and bs.booking.status = :status
            order by bs.seatCode
            """)
    List<String> findSeatCodesByShowtimeIdAndBookingStatus(
            @Param("showtimeId") UUID showtimeId,
            @Param("status") BookingStatus status
    );

    @Query("""
            select bs.seatCode
            from BookingSeat bs
            where bs.showtime.id = :showtimeId
              and bs.booking.status = :status
              and bs.seatCode in :seatCodes
            """)
    List<String> findConflictingSeatCodes(
            @Param("showtimeId") UUID showtimeId,
            @Param("status") BookingStatus status,
            @Param("seatCodes") Collection<String> seatCodes
    );
}
