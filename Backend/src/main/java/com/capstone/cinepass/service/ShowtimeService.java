package com.capstone.cinepass.service;

import com.capstone.cinepass.dto.ShowTimeResponse;

import java.util.List;

public interface ShowtimeService {

    ShowTimeResponse createShowtime(com.capstone.cinepass.dto.CreateShowtimeRequest request);

    List<ShowTimeResponse> getShowtimesByMovie(Long movieId);

    void deleteShowtime(Long showtimeId);
}
