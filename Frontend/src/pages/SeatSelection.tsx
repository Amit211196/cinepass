import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie, Showtime } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Clock, MapPin, ArrowLeft } from 'lucide-react';

export const SeatSelection: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const columns = Array.from({ length: 10 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      if (!showtimeId) return;
      setLoading(true);
      try {
        const allShowtimes = await api.movies.getAll().then(async (movies) => {
          let list: Showtime[] = [];
          for (let m of movies) {
            const st = await api.showtimes.getByMovieId(m.id);
            list.push(...st);
          }
          return list;
        });

        const activeShowtime = allShowtimes.find(s => s.id === showtimeId);
        if (!activeShowtime) {
          throw new Error('Showtime not found');
        }

        const movieData = await api.movies.getById(activeShowtime.movieId);
        const booked = await api.showtimes.getBookedSeats(showtimeId);

        setShowtime(activeShowtime);
        setMovie(movieData);
        setBookedSeats(booked);

        // Load pre-selected seats if redirected back from login
        if (location.state?.selectedSeats) {
          setSelectedSeats(location.state.selectedSeats);
        }
      } catch (err: any) {
        showToast(err.message || 'Error loading showtime details', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimeDetails();
  }, [showtimeId, navigate, showToast, location.state]);

  const handleSeatClick = (seatCode: string) => {
    if (bookedSeats.includes(seatCode)) return; // Already booked

    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) {
        // Remove selection
        return prev.filter((s) => s !== seatCode);
      } else {
        // Add selection (Max 6 seats)
        if (prev.length >= 6) {
          showToast('You can select a maximum of 6 seats', 'info');
          return prev;
        }
        return [...prev, seatCode];
      }
    });
  };

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) {
      showToast('Please select at least 1 seat', 'info');
      return;
    }

    if (!isAuthenticated) {
      showToast('Login required to complete booking', 'info');
      // Redirect to login, storing current selection and path to return to
      navigate('/login', {
        state: {
          from: `/book/${showtimeId}`,
          selectedSeats: selectedSeats,
        },
      });
      return;
    }

    // Go to booking confirmation page
    navigate(`/confirm-booking`, {
      state: {
        showtimeId,
        selectedSeats,
      },
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading theatre seating map...</p>
      </div>
    );
  }

  if (!showtime || !movie) return null;

  const totalPrice = selectedSeats.length * showtime.ticketPrice;
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="seat-selection-page">
      <Link to={`/movies/${movie.id}`} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <ArrowLeft size={16} />
        Back to Movie
      </Link>

      <div className="seat-selection-container">
        {/* Left Side: Seat Map */}
        <div className="seating-chart-panel">
          <div className="screen-visualizer"></div>
          <span className="screen-label">All eyes this way</span>

          {/* Seat Grid */}
          <div className="seat-grid">
            {rows.map((row) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {columns.map((col) => {
                  const seatCode = `${row}${col}`;
                  const isBooked = bookedSeats.includes(seatCode);
                  const isSelected = selectedSeats.includes(seatCode);

                  let seatClass = 'seat-available';
                  if (isBooked) seatClass = 'seat-booked';
                  else if (isSelected) seatClass = 'seat-selected';

                  return (
                    <button
                      key={seatCode}
                      className={`seat ${seatClass}`}
                      disabled={isBooked}
                      onClick={() => handleSeatClick(seatCode)}
                      title={isBooked ? `Seat ${seatCode} (Booked)` : `Seat ${seatCode}`}
                    >
                      {col}
                    </button>
                  );
                })}
                <span className="row-label" style={{ marginLeft: '10px' }}>{row}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="seating-legend">
            <div className="legend-item">
              <div className="legend-box seat-available" style={{ width: '16px', height: '16px', border: '1.5px solid var(--color-success)' }}></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-box seat-booked" style={{ width: '16px', height: '16px', border: '1.5px solid var(--color-danger)' }}></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-box seat-selected" style={{ width: '16px', height: '16px', border: '1.5px solid var(--color-secondary)' }}></div>
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Right Side: Selection Summary */}
        <div className="booking-summary-panel">
          <h3 className="summary-title">Summary</h3>
          
          <div className="summary-movie-card">
            <img src={movie.posterUrl} alt={movie.title} className="summary-poster" />
            <div>
              <h4 className="summary-movie-title">{movie.title}</h4>
              <p className="summary-movie-genre">{movie.genre} • {movie.rating}</p>
            </div>
          </div>

          <div className="summary-details-list">
            <div className="summary-detail-item">
              <span className="label">Theatre</span>
              <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} className="nav-icon" />
                {showtime.theatreName}
              </span>
            </div>
            <div className="summary-detail-item">
              <span className="label">Date</span>
              <span className="value">{formatDate(showtime.showDate)}</span>
            </div>
            <div className="summary-detail-item">
              <span className="label">Time</span>
              <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} className="nav-icon" />
                {showtime.showTime}
              </span>
            </div>
            <div className="summary-detail-item">
              <span className="label">Ticket Price</span>
              <span className="value">₹{showtime.ticketPrice} / seat</span>
            </div>
            <div className="summary-detail-item">
              <span className="label">Selected Seats</span>
              <span className="value">
                {selectedSeats.length > 0 ? (
                  <div className="selected-seats-badge-list">
                    {selectedSeats.map((s) => (
                      <span key={s} className="seat-badge">{s}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>None</span>
                )}
              </span>
            </div>
          </div>

          <div className="summary-total-section">
            <span className="summary-total-label">Total Amount</span>
            <span className="summary-total-price">₹{totalPrice}</span>
          </div>

          <button 
            className="btn btn-primary btn-book-now"
            disabled={selectedSeats.length === 0}
            onClick={handleProceedToBooking}
          >
            {isAuthenticated ? 'Book Seats' : 'Login to Book'}
          </button>
          
          <p className="seat-limit-notice">You can book up to 6 seats per transaction</p>
        </div>
      </div>
    </div>
  );
};
