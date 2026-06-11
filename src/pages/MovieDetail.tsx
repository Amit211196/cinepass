import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie, Showtime } from '../services/api';
import { Clock, MapPin, Calendar, Film, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const movieData = await api.movies.getById(id);
        const showtimesData = await api.showtimes.getByMovieId(id);
        setMovie(movieData);
        setShowtimes(showtimesData);
      } catch (err: any) {
        showToast(err.message || 'Failed to load movie details', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMovieAndShowtimes();
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading details & showtimes...</p>
      </div>
    );
  }

  if (!movie) return null;

  // Group showtimes by theatre name
  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    if (!acc[showtime.theatreName]) {
      acc[showtime.theatreName] = [];
    }
    acc[showtime.theatreName].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  // Helper: Format show date for display (e.g. "Mon, Oct 20")
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="movie-detail-page">
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <ArrowLeft size={16} />
        Back to Movies
      </Link>

      {/* Hero section */}
      <div className="movie-detail-hero">
        <div 
          className="movie-detail-blur-bg" 
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        ></div>
        <div className="movie-detail-content">
          <div className="movie-detail-poster-wrapper">
            <img src={movie.posterUrl} alt={movie.title} className="detail-poster" />
          </div>
          <div className="detail-info">
            <h1 className="detail-title">{movie.title}</h1>
            
            <div className="detail-badges">
              <span className="detail-badge accent">{movie.genre}</span>
              <span className="detail-badge">{movie.rating}</span>
              <span className="detail-badge">
                <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {movie.durationMins} min
              </span>
            </div>

            <div className="detail-synopsis-section">
              <h4 className="section-label">Synopsis</h4>
              <p className="detail-synopsis">{movie.synopsis}</p>
            </div>

            <div className="detail-cast-section">
              <h4 className="section-label">Cast</h4>
              <p className="detail-cast">{movie.cast}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes listing */}
      <div className="showtime-section">
        <h2 className="section-title" style={{ fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
          Available Showtimes
        </h2>
        
        {Object.keys(groupedShowtimes).length > 0 ? (
          Object.entries(groupedShowtimes).map(([theatre, slots]) => (
            <div key={theatre} className="showtime-group">
              <h3 className="theatre-name">
                <MapPin size={18} className="theatre-icon" />
                {theatre}
              </h3>
              <div className="showtimes-grid">
                {slots.map((slot) => (
                  <div 
                    key={slot.id} 
                    className="showtime-card"
                    onClick={() => navigate(`/book/${slot.id}`)}
                  >
                    <span className="showtime-date">
                      <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {formatDisplayDate(slot.showDate)}
                    </span>
                    <span className="showtime-time">{slot.showTime}</span>
                    <span className="showtime-price">₹{slot.ticketPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings-placeholder" style={{ marginTop: '20px' }}>
            <Film size={32} style={{ marginBottom: '12px', color: 'var(--color-text-muted)' }} />
            <h3>No Showtimes Available</h3>
            <p>Check back later or contact admin to seed showtimes for this movie.</p>
          </div>
        )}
      </div>
    </div>
  );
};
