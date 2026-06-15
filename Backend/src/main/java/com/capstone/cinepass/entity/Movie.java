package com.capstone.cinepass.entity;

import com.capstone.cinepass.constant.Genre;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genre genre;

    @Column(nullable = false)
    private LocalDate releaseDate;

    @Column(nullable = false)
    private boolean active;

    public Movie(String title, String description, Genre genre, LocalDate releaseDate, boolean active) {
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.releaseDate = releaseDate;
        this.active = active;
    }
}