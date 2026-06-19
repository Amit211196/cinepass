export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  durationMins: number;
  rating: string;
  posterUrl: string;
  synopsis: string;
  cast: string;
  createdAt: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  theatreName: string;
  showDate: string; // YYYY-MM-DD
  showTime: string; // HH:MM
  ticketPrice: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  createdAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  totalPrice: number;
  seatCodes: string[];
  // Joined fields for easy access on UI
  movieTitle?: string;
  moviePoster?: string;
  theatreName?: string;
  showDate?: string;
  showTime?: string;
  customerName?: string;
  customerEmail?: string;
}

// Keys for localStorage
const KEYS = {
  USERS: 'cinepass_users',
  MOVIES: 'cinepass_movies',
  SHOWTIMES: 'cinepass_showtimes',
  BOOKINGS: 'cinepass_bookings',
  CURRENT_USER: 'cinepass_current_user',
};


// Helper: Generate UUID
const uuid = () => Math.random().toString(36).substring(2, 11);

// Helper: Get data from local storage
const getStorage = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

// Helper: Set data to local storage
const setStorage = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Seed Data
const seedInitialData = () => {
  // 1. Seed Users (1 Admin, 1 Regular User)
  const users = getStorage<any[]>(KEYS.USERS, []);
  if (users.length === 0) {
    const adminUser = {
      id: uuid(),
      email: 'admin@cinepass.com',
      password: 'admin123', // plain text for simplicity in mock, normally hashed
      name: 'Admin User',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    const regularUser = {
      id: uuid(),
      email: 'user@cinepass.com',
      password: 'user123',
      name: 'John Doe',
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setStorage(KEYS.USERS, [adminUser, regularUser]);
  }

  // 2. Seed Movies (At least 6 movies as per requirements)
  const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
  if (movies.length === 0) {
    const seedMovies: Movie[] = [
      {
        id: 'movie-interstellar',
        title: 'Interstellar',
        genre: 'Sci-Fi',
        durationMins: 169,
        rating: 'U/A',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. Confronted with a dying Earth, they embark on a journey that transcends space and time.',
        cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'movie-lionking',
        title: 'The Lion King',
        genre: 'Animation',
        durationMins: 118,
        rating: 'U',
        posterUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=600&auto=format&fit=crop',
        synopsis: 'A young lion prince, Simba, flees his kingdom after his father\'s death, only to learn the true meaning of responsibility and bravery before returning to reclaim his throne.',
        cast: 'Donald Glover, Beyoncé Knowles-Carter, James Earl Jones, Seth Rogen',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'movie-inception',
        title: 'Inception',
        genre: 'Sci-Fi',
        durationMins: 148,
        rating: 'U/A',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
        synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
        cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'movie-darkknight',
        title: 'The Dark Knight',
        genre: 'Action',
        durationMins: 152,
        rating: 'U/A',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        cast: 'Christian Bale, Heath Ledger, Aaron Eckhart, Maggie Gyllenhaal',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'movie-avatar2',
        title: 'Avatar: The Way of Water',
        genre: 'Action',
        durationMins: 192,
        rating: 'U/A',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
        synopsis: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race.',
        cast: 'Sam Worthington, Zoe Saldana, Sigourney Weaver, Kate Winslet',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'movie-spiritedaway',
        title: 'Spirited Away',
        genre: 'Animation',
        durationMins: 125,
        rating: 'U',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
        synopsis: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
        cast: 'Rumi Hiiragi, Miyu Irino, Mari Natsuki, Takashi Naito',
        createdAt: new Date().toISOString(),
      }
    ];
    setStorage(KEYS.MOVIES, seedMovies);
  }

  // 3. Seed Showtimes
  const showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
  if (showtimes.length === 0) {
    const today = new Date();
    const formatDate = (daysAhead: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    const seedShowtimes: Showtime[] = [
      {
        id: 'st-interstellar-1',
        movieId: 'movie-interstellar',
        theatreName: 'PVR Cinemas',
        showDate: formatDate(1),
        showTime: '18:30',
        ticketPrice: 250,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-interstellar-2',
        movieId: 'movie-interstellar',
        theatreName: 'INOX Multiplex',
        showDate: formatDate(2),
        showTime: '21:00',
        ticketPrice: 280,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-lionking-1',
        movieId: 'movie-lionking',
        theatreName: 'INOX Multiplex',
        showDate: formatDate(1),
        showTime: '15:00',
        ticketPrice: 200,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-lionking-2',
        movieId: 'movie-lionking',
        theatreName: 'Cinepolis',
        showDate: formatDate(2),
        showTime: '11:30',
        ticketPrice: 180,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-inception-1',
        movieId: 'movie-inception',
        theatreName: 'PVR Cinemas',
        showDate: formatDate(1),
        showTime: '20:45',
        ticketPrice: 250,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-darkknight-1',
        movieId: 'movie-darkknight',
        theatreName: 'Cinepolis IMAX',
        showDate: formatDate(1),
        showTime: '17:15',
        ticketPrice: 350,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-avatar-1',
        movieId: 'movie-avatar2',
        theatreName: 'PVR IMAX',
        showDate: formatDate(2),
        showTime: '14:00',
        ticketPrice: 320,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st-spirited-1',
        movieId: 'movie-spiritedaway',
        theatreName: 'INOX Multiplex',
        showDate: formatDate(1),
        showTime: '12:00',
        ticketPrice: 190,
        createdAt: new Date().toISOString(),
      }
    ];
    setStorage(KEYS.SHOWTIMES, seedShowtimes);
  }

  // 4. Seed some initial bookings
  const bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
  if (bookings.length === 0) {
    // Let's pre-book a few seats for test
    const seedBookings: Booking[] = [
      {
        id: 'b-seed-1',
        userId: 'some-user-id',
        showtimeId: 'st-interstellar-1',
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        totalPrice: 500,
        seatCodes: ['A4', 'A5'],
      },
      {
        id: 'b-seed-2',
        userId: 'some-user-id-2',
        showtimeId: 'st-lionking-1',
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        totalPrice: 200,
        seatCodes: ['C5'],
      }
    ];
    setStorage(KEYS.BOOKINGS, seedBookings);
  }
};

// Initialize seed data
seedInitialData();

// API Service Implementation
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const BASE_URL = configuredApiBaseUrl && configuredApiBaseUrl.length > 0
  ? configuredApiBaseUrl.replace(/\/$/, '')
  : 'http://localhost:8080/api';

const getAuthHeaders = (): Record<string, string> => {
  const currentUser = getStorage<{ token: string } | null>(KEYS.CURRENT_USER, null);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (currentUser && currentUser.token) {
    headers['Authorization'] = `Bearer ${currentUser.token}`;
  }
  return headers;
};

const getErrorMessage = async (response: Response, defaultMsg: string): Promise<string> => {
  try {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data?.message || defaultMsg;
    } catch {
      return text || defaultMsg;
    }
  } catch {
    return defaultMsg;
  }
};

const mapGenreToBackend = (genre: string): string => {
  const mapping: { [key: string]: string } = {
    'sci-fi': 'SCI_FI',
    'action': 'ACTION',
    'animation': 'ANIMATION',
    'comedy': 'COMEDY',
    'drama': 'DRAMA',
    'horror': 'HORROR',
    'romance': 'ROMANCE',
    'thriller': 'THRILLER'
  };
  return mapping[genre.toLowerCase()] || genre.toUpperCase();
};

const mapGenreToFrontend = (genre: string): string => {
  const mapping: { [key: string]: string } = {
    'SCI_FI': 'Sci-Fi',
    'ACTION': 'Action',
    'ANIMATION': 'Animation',
    'COMEDY': 'Comedy',
    'DRAMA': 'Drama',
    'HORROR': 'Horror',
    'ROMANCE': 'Romance',
    'THRILLER': 'Thriller'
  };
  return mapping[genre.toUpperCase()] || genre;
};

const mapMovieToFrontend = (m: any): Movie => {
  return {
    id: String(m.id),
    title: m.title,
    genre: mapGenreToFrontend(m.genre),
    durationMins: m.durationMins || 120,
    rating: m.rating || 'U/A',
    posterUrl: m.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    synopsis: m.synopsis || m.description || 'No description available.',
    cast: m.castText || 'Cast details not specified.',
    createdAt: new Date().toISOString(),
  };
};


const mapShowtimeToFrontend = (st: any): Showtime => {
  return {
    id: String(st.id),
    movieId: String(st.movieId),
    theatreName: st.theatreName,
    showDate: st.showDate,
    showTime: st.showTime ? st.showTime.substring(0, 5) : '',
    ticketPrice: Number(st.ticketPrice),
    createdAt: new Date().toISOString()
  };
};

const mapBookingToFrontend = (b: any): Booking => {
  return {
    id: String(b.id),
    userId: String(b.userId),
    showtimeId: String(b.showtimeId),
    createdAt: b.bookedAt || new Date().toISOString(),
    status: b.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
    totalPrice: Number(b.totalPrice),
    seatCodes: b.seatCodes || [],
    movieTitle: b.movieTitle || 'Unknown Movie',
    moviePoster: b.moviePoster || '',
    theatreName: b.theatreName || 'Unknown Theatre',
    showDate: b.showDate || '',
    showTime: b.showTime ? b.showTime.substring(0, 5) : '',
    customerName: b.customerName || 'Guest User',
    customerEmail: b.customerEmail || 'N/A'
  };
};

// API Service Implementation
export const api = {
  // --- AUTH ENDPOINTS ---
  auth: {
    register: async (email: string, name: string, passwordHash: string): Promise<User> => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: passwordHash })
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to register'));
      }
      const data = await response.json();
      return {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        isAdmin: data.user.isAdmin,
        createdAt: new Date().toISOString()
      };
    },

    login: async (email: string, passwordHash: string): Promise<{ token: string; user: User }> => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordHash })
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to login'));
      }
      const data = await response.json();
      const user: User = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        isAdmin: data.user.isAdmin,
        createdAt: new Date().toISOString()
      };
      const result = { token: data.token, user };
      setStorage(KEYS.CURRENT_USER, result);
      return result;
    },

    logout: async (): Promise<void> => {
      localStorage.removeItem(KEYS.CURRENT_USER);
    },

    getCurrentUser: (): { token: string; user: User } | null => {
      return getStorage<{ token: string; user: User } | null>(KEYS.CURRENT_USER, null);
    }
  },

  // --- MOVIES ENDPOINTS ---
  movies: {
    getAll: async (genre?: string): Promise<Movie[]> => {
      let url = `${BASE_URL}/movies`;
      if (genre && genre !== 'All') {
        url += `?genre=${mapGenreToBackend(genre)}`;
      }
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const list = await response.json();
      return list.map(mapMovieToFrontend);
    },

    getById: async (id: string): Promise<Movie> => {
      const response = await fetch(`${BASE_URL}/movies/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Movie not found');
      }
      const m = await response.json();
      return mapMovieToFrontend(m);
    },

    create: async (movieData: Omit<Movie, 'id' | 'createdAt'>): Promise<Movie> => {
      const response = await fetch(`${BASE_URL}/movies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: movieData.title,
          description: movieData.synopsis,
          genre: mapGenreToBackend(movieData.genre),
          releaseDate: new Date().toISOString().split('T')[0],
          durationMins: movieData.durationMins,
          rating: movieData.rating,
          posterUrl: movieData.posterUrl,
          synopsis: movieData.synopsis,
          castText: movieData.cast
        })
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to create movie'));
      }
      const created = await response.json();
      return mapMovieToFrontend(created);
    },

    update: async (id: string, movieData: Partial<Omit<Movie, 'id' | 'createdAt'>>): Promise<Movie> => {
      const existingMovie = await api.movies.getById(id);
      const merged = { ...existingMovie, ...movieData };
      const response = await fetch(`${BASE_URL}/movies/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: merged.title,
          description: merged.synopsis,
          genre: mapGenreToBackend(merged.genre),
          releaseDate: new Date().toISOString().split('T')[0],
          durationMins: merged.durationMins,
          rating: merged.rating,
          posterUrl: merged.posterUrl,
          synopsis: merged.synopsis,
          castText: merged.cast
        })
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to update movie'));
      }
      const updated = await response.json();
      return mapMovieToFrontend(updated);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/movies/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }
    }
  },

  // --- SHOWTIMES ENDPOINTS ---
  showtimes: {
    getByMovieId: async (movieId: string): Promise<Showtime[]> => {
      const response = await fetch(`${BASE_URL}/showtimes/movie/${movieId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch showtimes');
      }
      const list = await response.json();
      return list.map(mapShowtimeToFrontend);
    },

    getBookedSeats: async (showtimeId: string): Promise<string[]> => {
      const response = await fetch(`${BASE_URL}/showtimes/${showtimeId}/seats`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch booked seats');
      }
      return await response.json();
    },

    create: async (showtimeData: Omit<Showtime, 'id' | 'createdAt'>): Promise<Showtime> => {
      const response = await fetch(`${BASE_URL}/showtimes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          movieId: showtimeData.movieId,
          theatreName: showtimeData.theatreName,
          showDate: showtimeData.showDate,
          showTime: showtimeData.showTime.split(':').length === 2 ? `${showtimeData.showTime}:00` : showtimeData.showTime, // Format to HH:MM:SS
          ticketPrice: showtimeData.ticketPrice
        })
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to create showtime'));
      }
      const created = await response.json();
      return mapShowtimeToFrontend(created);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/showtimes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to delete showtime');
      }
    },

    update: async (id: string, showtimeData: Omit<Showtime, 'id' | 'createdAt'>): Promise<Showtime> => {
      const response = await fetch(`${BASE_URL}/showtimes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          movieId: showtimeData.movieId,
          theatreName: showtimeData.theatreName,
          showDate: showtimeData.showDate,
          showTime: showtimeData.showTime.split(':').length === 2 ? `${showtimeData.showTime}:00` : showtimeData.showTime, // Format to HH:MM:SS
          ticketPrice: showtimeData.ticketPrice
        })
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to update showtime'));
      }
      const updated = await response.json();
      return mapShowtimeToFrontend(updated);
    }
  },

  // --- BOOKINGS ENDPOINTS ---
  bookings: {
    create: async (_userId: string, showtimeId: string, seatCodes: string[]): Promise<Booking> => {
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          showtimeId: showtimeId,
          seatCodes: seatCodes
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create booking');
      }
      const created = await response.json();
      return mapBookingToFrontend(created);
    },

    getByUser: async (_userId: string): Promise<Booking[]> => {
      const response = await fetch(`${BASE_URL}/bookings/mine`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user bookings');
      }
      const list = await response.json();
      return list.map(mapBookingToFrontend);
    },

    getAll: async (): Promise<Booking[]> => {
      const response = await fetch(`${BASE_URL}/bookings`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch all bookings');
      }
      const list = await response.json();
      return list.map(mapBookingToFrontend);
    },

    cancel: async (bookingId: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
    }
  }
};
