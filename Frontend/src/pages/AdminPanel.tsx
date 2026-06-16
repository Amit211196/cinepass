import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Movie, Showtime, Booking } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, Film, Calendar, X, Ticket } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'showtimes' | 'bookings'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // Modal States
  const [movieModalOpen, setMovieModalOpen] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  
  const [showtimeModalOpen, setShowtimeModalOpen] = useState<boolean>(false);

  // Movie Form Fields
  const [movieTitle, setMovieTitle] = useState<string>('');
  const [movieGenre, setMovieGenre] = useState<string>('Sci-Fi');
  const [movieDuration, setMovieDuration] = useState<number>(120);
  const [movieRating, setMovieRating] = useState<string>('U/A');
  const [moviePoster, setMoviePoster] = useState<string>('');
  const [movieSynopsis, setMovieSynopsis] = useState<string>('');
  const [movieCast, setMovieCast] = useState<string>('');

  // Showtime Form Fields
  const [stMovieId, setStMovieId] = useState<string>('');
  const [stTheatre, setStTheatre] = useState<string>('');
  const [stDate, setStDate] = useState<string>('');
  const [stTime, setStTime] = useState<string>('');
  const [stPrice, setStPrice] = useState<number>(200);

  const genres = ['Sci-Fi', 'Animation', 'Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance'];
  const ratings = ['U', 'U/A', 'A'];

  const loadData = async () => {
    setLoading(true);
    try {
      const allMovies = await api.movies.getAll();
      setMovies(allMovies);
      
      // Load all showtimes
      let list: Showtime[] = [];
      for (let m of allMovies) {
        const st = await api.showtimes.getByMovieId(m.id);
        list.push(...st);
      }
      setShowtimes(list);

      // Load all bookings
      const bookingsData = await api.bookings.getAll();
      setAllBookings(bookingsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Add Movie Modal
  const openAddMovieModal = () => {
    setEditingMovie(null);
    setMovieTitle('');
    setMovieGenre('Sci-Fi');
    setMovieDuration(120);
    setMovieRating('U/A');
    setMoviePoster('');
    setMovieSynopsis('');
    setMovieCast('');
    setMovieModalOpen(true);
  };

  // Open Edit Movie Modal
  const openEditMovieModal = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieTitle(movie.title);
    setMovieGenre(movie.genre);
    setMovieDuration(movie.durationMins);
    setMovieRating(movie.rating);
    setMoviePoster(movie.posterUrl);
    setMovieSynopsis(movie.synopsis);
    setMovieCast(movie.cast);
    setMovieModalOpen(true);
  };

  // Save/Update Movie
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle || !moviePoster || !movieSynopsis || !movieCast) {
      showToast('Please fill in all movie fields', 'error');
      return;
    }

    const movieData = {
      title: movieTitle,
      genre: movieGenre,
      durationMins: movieDuration,
      rating: movieRating,
      posterUrl: moviePoster,
      synopsis: movieSynopsis,
      cast: movieCast,
    };

    try {
      if (editingMovie) {
        await api.movies.update(editingMovie.id, movieData);
        showToast('Movie updated successfully', 'success');
      } else {
        await api.movies.create(movieData);
        showToast('New movie added successfully', 'success');
      }
      setMovieModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save movie', 'error');
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also delete all its showtimes and bookings!`)) {
      return;
    }
    try {
      await api.movies.delete(id);
      showToast('Movie deleted successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete movie', 'error');
    }
  };

  // Open Add Showtime Modal
  const openAddShowtimeModal = () => {
    if (movies.length === 0) {
      showToast('Please add a movie first', 'info');
      return;
    }
    setStMovieId(movies[0].id);
    setStTheatre('');
    // Default show date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStDate(tomorrow.toISOString().split('T')[0]);
    setStTime('18:00');
    setStPrice(200);
    setShowtimeModalOpen(true);
  };

  // Save Showtime
  const handleSaveShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stMovieId || !stTheatre || !stDate || !stTime || stPrice <= 0) {
      showToast('Please fill in all showtime fields correctly', 'error');
      return;
    }

    const showtimeData = {
      movieId: stMovieId,
      theatreName: stTheatre,
      showDate: stDate,
      showTime: stTime,
      ticketPrice: Number(stPrice),
    };

    try {
      await api.showtimes.create(showtimeData);
      showToast('Showtime created successfully', 'success');
      setShowtimeModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create showtime', 'error');
    }
  };

  // Delete Showtime
  const handleDeleteShowtime = async (id: string) => {
    if (!window.confirm('Delete this showtime? This will also cancel all bookings associated with it.')) {
      return;
    }
    try {
      await api.showtimes.delete(id);
      showToast('Showtime deleted successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete showtime', 'error');
    }
  };
  // Cancel Booking
  const handleCancelBooking = async (id: string) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${id}? This will free the seats.`)) {
      return;
    }
    try {
      await api.bookings.cancel(id);
      showToast('Booking cancelled successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };
  // Map Movie Title from ID
  const getMovieTitle = (id: string) => {
    const m = movies.find(m => m.id === id);
    return m ? m.title : 'Unknown Movie';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage CinePass database catalogs, showtimes, and movie lists.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          <Film size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Manage Movies
        </button>
        <button 
          className={`admin-tab ${activeTab === 'showtimes' ? 'active' : ''}`}
          onClick={() => setActiveTab('showtimes')}
        >
          <Calendar size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Manage Showtimes
        </button>
        <button 
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Ticket size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          View Bookings
        </button>
      </div>

      {/* Main Catalog View */}
      <div className="admin-content-card">
        {activeTab === 'movies' ? (
          <div>
            <div className="admin-section-header">
              <h3>Movie Catalog ({movies.length} movies)</h3>
              <button className="btn btn-primary btn-sm" onClick={openAddMovieModal}>
                <Plus size={16} />
                Add New Movie
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Movie Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <img 
                          src={m.posterUrl} 
                          alt={m.title} 
                          style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-glass)' }} 
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{m.title}</td>
                      <td>{m.genre}</td>
                      <td>{m.durationMins} min</td>
                      <td>
                        <span className="admin-tag" style={{ background: 'var(--border-glass)', border: '1px solid var(--border-glass)', color: '#fff' }}>
                          {m.rating}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => openEditMovieModal(m)}
                            title="Edit details"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteMovie(m.id, m.title)}
                            title="Delete movie"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {movies.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
                        No movies in catalog. Click "Add New Movie" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'showtimes' ? (
          <div>
            <div className="admin-section-header">
              <h3>Seeded Showtimes ({showtimes.length} slots)</h3>
              <button className="btn btn-primary btn-sm" onClick={openAddShowtimeModal}>
                <Plus size={16} />
                Add New Showtime
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Theatre</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Ticket Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map((st) => (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{getMovieTitle(st.movieId)}</td>
                      <td>{st.theatreName}</td>
                      <td>{st.showDate}</td>
                      <td>{st.showTime}</td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>₹{st.ticketPrice}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteShowtime(st.id)}
                          title="Delete showtime"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {showtimes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
                        No showtimes scheduled. Click "Add New Showtime" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="admin-section-header">
              <h3>All Customer Bookings ({allBookings.length} bookings)</h3>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Theatre / Slot</th>
                    <th>Seats Booked</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{b.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{b.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{b.customerEmail}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{b.movieTitle}</td>
                      <td>
                        <div>{b.theatreName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {b.showDate} at {b.showTime}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {b.seatCodes.map((seat) => (
                            <span key={seat} className="seat-badge">{seat}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>₹{b.totalPrice}</td>
                      <td>
                        <span className={`booking-status-badge ${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'CONFIRMED' ? (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelBooking(b.id)}
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
                        No bookings exist in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- MOVIE ADD/EDIT MODAL --- */}
      {movieModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingMovie ? 'Edit Movie Details' : 'Add New Movie'}</h3>
              <X className="btn-close" onClick={() => setMovieModalOpen(false)} />
            </div>
            <form onSubmit={handleSaveMovie}>
              <div className="modal-body">
                <div className="admin-form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Movie Title</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={movieTitle} 
                      onChange={(e) => setMovieTitle(e.target.value)} 
                      placeholder="e.g. Interstellar"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Genre</label>
                    <select 
                      className="admin-select"
                      value={movieGenre}
                      onChange={(e) => setMovieGenre(e.target.value)}
                    >
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select 
                      className="admin-select"
                      value={movieRating}
                      onChange={(e) => setMovieRating(e.target.value)}
                    >
                      {ratings.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      value={movieDuration} 
                      onChange={(e) => setMovieDuration(Number(e.target.value))} 
                      min={1}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Poster Image URL</label>
                    <input 
                      type="url" 
                      className="admin-input" 
                      value={moviePoster} 
                      onChange={(e) => setMoviePoster(e.target.value)} 
                      placeholder="https://unsplash.com/..."
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Cast (Comma-separated text)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={movieCast} 
                      onChange={(e) => setMovieCast(e.target.value)} 
                      placeholder="Leonardo DiCaprio, Tom Hardy, Elliot Page"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Synopsis</label>
                    <textarea 
                      rows={4} 
                      className="admin-textarea"
                      value={movieSynopsis}
                      onChange={(e) => setMovieSynopsis(e.target.value)}
                      placeholder="Enter synopsis here..."
                      style={{ resize: 'none' }}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setMovieModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Movie</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SHOWTIME ADD MODAL --- */}
      {showtimeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Showtime Slot</h3>
              <X className="btn-close" onClick={() => setShowtimeModalOpen(false)} />
            </div>
            <form onSubmit={handleSaveShowtime}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Movie</label>
                    <select 
                      className="admin-select"
                      value={stMovieId}
                      onChange={(e) => setStMovieId(e.target.value)}
                    >
                      {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Theatre Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={stTheatre} 
                      onChange={(e) => setStTheatre(e.target.value)} 
                      placeholder="e.g. PVR Cinemas, INOX"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Show Date</label>
                      <input 
                        type="date" 
                        className="admin-input" 
                        value={stDate} 
                        onChange={(e) => setStDate(e.target.value)} 
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Show Time</label>
                      <input 
                        type="time" 
                        className="admin-input" 
                        value={stTime} 
                        onChange={(e) => setStTime(e.target.value)} 
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ticket Price (INR)</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      value={stPrice} 
                      onChange={(e) => setStPrice(Number(e.target.value))} 
                      min={10}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowtimeModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Showtime</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
