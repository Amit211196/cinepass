package com.capstone.cinepass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Showtime {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "movie_id", nullable = false)
    private UUID movieId;

    @Column(name = "theatre_name", nullable = false, length = 120)
    private String theatreName;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "show_time", nullable = false)
    private LocalTime showTime;

    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;
}
