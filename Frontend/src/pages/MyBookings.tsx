import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Booking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Clock, MapPin, XCircle, Film } from 'lucide-react';

// Subcomponent: Live Countdown Timer (Stretch Goal)
const CountdownTimer: React.FC<{ dateStr: string; timeStr: string }> = ({ dateStr, timeStr }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPassed, setIsPassed] = useState<boolean>(false);

  useEffect(() => {
    // Parse target date time
    // E.g., dateStr = "2026-10-20", timeStr = "18:30"
    const targetDate = new Date(`${dateStr}T${timeStr}:00`);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsPassed(true);
        setTimeLeft('Show started');
        return;
      }

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`Starts in ${days}d ${hours}h`);
      } else {
        const pad = (num: number) => String(num).padStart(2, '0');
        setTimeLeft(`Starts in ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  if (isPassed) {
    return <span className="countdown-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', borderColor: 'var(--border-glass)' }}>Show Started</span>;
  }

  return <span className="countdown-tag">{timeLeft}</span>;
};

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchUserBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.bookings.getByUser(user.id);
      setBookings(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will immediately free your seats.')) {
      return;
    }

    try {
      await api.bookings.cancel(bookingId);
      showToast('Booking cancelled successfully! Seats have been freed.', 'success');
      // Refresh list
      fetchUserBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your ticket dashboard...</p>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Manage your reservations, check timers, or cancel tickets.</p>
      </div>

      {bookings.length > 0 ? (
        <div className="bookings-grid">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'CONFIRMED';
            
            return (
              <div key={booking.id} className="booking-card">
                <img 
                  src={booking.moviePoster || 'https://picsum.photos/seed/default/120/180'} 
                  alt={booking.movieTitle} 
                  className="booking-poster" 
                />
                
                <div className="booking-info">
                  <div className="booking-main-details">
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      ID: {booking.id}
                    </span>
                    <h3 className="booking-movie-title">{booking.movieTitle}</h3>
                    
                    <div className="booking-meta-row">
                      <div className="booking-meta-item">
                        <MapPin size={14} className="nav-icon" />
                        <span>{booking.theatreName}</span>
                      </div>
                      <div className="booking-meta-item">
                        <Calendar size={14} className="nav-icon" />
                        <span>{formatDate(booking.showDate)}</span>
                      </div>
                      <div className="booking-meta-item">
                        <Clock size={14} className="nav-icon" />
                        <span>{booking.showTime}</span>
                      </div>
                    </div>

                    <div className="booking-seats-display">
                      <span className="booking-seats-label">Seats:</span>
                      <div className="booking-seats-list">
                        {booking.seatCodes.map((s) => (
                          <span key={s} className="seat-badge">{s}</span>
                        ))}
                      </div>
                      <span style={{ marginLeft: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                        Total: ₹{booking.totalPrice}
                      </span>
                    </div>
                  </div>

                  <div className="booking-status-actions">
                    {/* Countdown and Status tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isConfirmed && booking.showDate && booking.showTime && (
                        <CountdownTimer dateStr={booking.showDate} timeStr={booking.showTime} />
                      )}
                      <span className={`booking-status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>

                    {isConfirmed && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}
                      >
                        <XCircle size={14} />
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-bookings-placeholder">
          <Film size={48} style={{ marginBottom: '16px', color: 'var(--color-text-muted)' }} />
          <h3>No Bookings Found</h3>
          <p>You haven't booked any movie tickets yet.</p>
          <a href="/" className="btn btn-primary btn-sm" style={{ marginTop: '20px' }}>
            Browse Movies
          </a>
        </div>
      )}
    </div>
  );
};
