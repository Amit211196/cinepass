import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie } from '../services/api';
import { Search, Film, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const genres = ['All', 'Sci-Fi', 'Animation', 'Action']; // In-scope genres + All

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const fetchedMovies = await api.movies.getAll();
        setMovies(fetchedMovies);
      } catch (err: any) {
        showToast(err.message || 'Failed to load movies', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [showToast]);

  const filteredMovies = movies.filter((movie) => {
    const matchesGenre = selectedGenre === 'All' || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading the latest movies...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero section */}
      <div className="home-hero">
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop" 
          alt="Cinema Banner" 
          className="hero-bg" 
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>CinePass</h1>
            <p>Experience cinema like never before. Browse showtimes, select seats, and secure your tickets effortlessly.</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="genre-filters">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} className="nav-icon" />
          <input 
            type="text" 
            placeholder="Search movies or genres..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="movie-grid">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <div className="movie-poster-container">
                <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
                <span className="movie-rating-badge">{movie.rating}</span>
              </div>
              <div className="movie-card-info">
                <span className="movie-card-genre">{movie.genre}</span>
                <h3 className="movie-card-title">{movie.title}</h3>
                
                <div className="movie-card-meta">
                  <span>
                    <Clock size={14} />
                    {movie.durationMins} min
                  </span>
                  <span>
                    <Film size={14} />
                    HD
                  </span>
                </div>

                <button 
                  className="btn btn-primary movie-card-btn"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  Book Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-bookings-placeholder" style={{ padding: '80px 20px' }}>
          <Film size={40} style={{ marginBottom: '16px', color: 'var(--color-primary)' }} />
          <h3>No Movies Found</h3>
          <p>We couldn't find any movies matching "{searchQuery}" in genre "{selectedGenre}".</p>
        </div>
      )}
    </div>
  );
};
