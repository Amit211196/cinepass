package com.capstone.cinepass.entity;

import com.capstone.cinepass.constant.Genre;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "movie_seq_gen")
    @SequenceGenerator(name = "movie_seq_gen", sequenceName = "movie_sequence", allocationSize = 1)
    private Long id;

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
    private int durationMins;

    @Column(nullable = false)
    private String rating;

    @Column(nullable = false, length = 1000)
    private String posterUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String synopsis;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String castText;

    @Column(nullable = false)
    private boolean active;

    public Movie(String title, String description, Genre genre, LocalDate releaseDate, int durationMins, String rating, String posterUrl, String synopsis, String castText, boolean active) {
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.releaseDate = releaseDate;
        this.durationMins = durationMins;
        this.rating = rating;
        this.posterUrl = posterUrl;
        this.synopsis = synopsis;
        this.castText = castText;
        this.active = active;
    }
}