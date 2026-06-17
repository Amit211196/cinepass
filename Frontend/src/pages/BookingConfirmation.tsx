import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Movie, Showtime, Booking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { showtimeId, selectedSeats } = location.state || {};

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirming, setConfirming] = useState<boolean>(false);

  useEffect(() => {
    if (!showtimeId || !selectedSeats || selectedSeats.length === 0) {
      showToast('No booking information found', 'error');
      navigate('/');
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Find showtime
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
        setShowtime(activeShowtime);
        setMovie(movieData);
      } catch (err: any) {
        showToast(err.message || 'Error loading confirmation details', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [showtimeId, selectedSeats, navigate, showToast]);

  const handleConfirmBooking = async () => {
    if (!user || !showtimeId || !selectedSeats) return;
    setConfirming(true);
    try {
      const booking = await api.bookings.create(user.id, showtimeId, selectedSeats);
      setConfirmedBooking(booking);
      showToast('Ticket booking confirmed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to complete booking', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Preparing ticket invoice...</p>
      </div>
    );
  }

  if (!movie || !showtime) return null;

  const totalAmount = selectedSeats.length * showtime.ticketPrice;
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="booking-confirmation-page">
      {!confirmedBooking ? (
        <>
          <button 
            onClick={() => navigate(`/book/${showtimeId}`, { state: { selectedSeats } })} 
            className="btn btn-secondary btn-sm" 
            style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            Modify Seat Selection
          </button>

          <div className="confirmation-card">
            <div className="confirmation-header" style={{ background: 'linear-gradient(135deg, var(--color-primary), #d00030)' }}>
              <h2>Review Your Order</h2>
              <p>Please review your ticket details before confirming booking</p>
            </div>
            
            <div className="confirmation-body">
              <div className="receipt-row">
                <span className="receipt-label">Movie</span>
                <span className="receipt-value" style={{ fontWeight: 800 }}>{movie.title}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Theatre</span>
                <span className="receipt-value">{showtime.theatreName}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Show Date</span>
                <span className="receipt-value">{formatDate(showtime.showDate)}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Show Time</span>
                <span className="receipt-value">{showtime.showTime}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Selected Seats</span>
                <span className="receipt-value" style={{ letterSpacing: '1px' }}>
                  {selectedSeats.join(', ')} ({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Price per Ticket</span>
                <span className="receipt-value">₹{showtime.ticketPrice}</span>
              </div>
              <div className="receipt-row total">
                <span className="receipt-label" style={{ color: '#fff' }}>Total Amount</span>
                <span className="receipt-value price">₹{totalAmount}</span>
              </div>

              <div className="confirmation-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleConfirmBooking}
                  disabled={confirming}
                >
                  {confirming ? 'Confirming Bookings...' : 'Confirm & Book'}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="confirm-icon-wrapper">
              <CheckCircle2 size={36} color="#fff" />
            </div>
            <h2>Booking Confirmed!</h2>
            <p>Your tickets have been secured successfully.</p>
          </div>
          
          <div className="confirmation-body">
            <div className="receipt-row">
              <span className="receipt-label">Booking ID</span>
              <span className="receipt-value" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                {confirmedBooking.id}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Movie</span>
              <span className="receipt-value" style={{ fontWeight: 800 }}>{movie.title}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Theatre</span>
              <span className="receipt-value">{showtime.theatreName}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Date & Time</span>
              <span className="receipt-value">
                {formatDate(showtime.showDate)} at {showtime.showTime}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Seats Booked</span>
              <span className="receipt-value">{confirmedBooking.seatCodes.join(', ')}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment Status</span>
              <span className="receipt-value" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                PAID
              </span>
            </div>
            <div className="receipt-row total">
              <span className="receipt-label" style={{ color: '#fff' }}>Total Paid</span>
              <span className="receipt-value price">₹{confirmedBooking.totalPrice}</span>
            </div>

            <div className="confirmation-actions">
              <button className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={16} />
                Print Receipt
              </button>
              <Link to="/my-bookings" className="btn btn-primary">
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
