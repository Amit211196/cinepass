package com.capstone.cinepass.service;

import com.capstone.cinepass.dto.ShowTimeResponse;

import java.util.List;
import java.util.UUID;

public interface ShowtimeService {

    ShowTimeResponse createShowtime(com.capstone.cinepass.dto.CreateShowtimeRequest request);

    ShowTimeResponse updateShowtime(UUID showtimeId, com.capstone.cinepass.dto.UpdateShowtimeRequest request);

    List<ShowTimeResponse> getShowtimesByMovie(UUID movieId);

    void deleteShowtime(UUID showtimeId);
}
