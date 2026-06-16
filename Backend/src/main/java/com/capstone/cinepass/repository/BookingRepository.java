package com.capstone.cinepass.repository;

import com.capstone.cinepass.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @EntityGraph(attributePaths = {"showtime", "user", "seats"})
    List<Booking> findByUser_IdOrderByBookedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"showtime", "user", "seats"})
    @Query("select b from Booking b where b.id = :id")
    Optional<Booking> findWithDetailsById(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"showtime", "user", "seats"})
    List<Booking> findAll();
}
