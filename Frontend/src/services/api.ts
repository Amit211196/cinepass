const API_BASE_URL = 'http://localhost:8080/api';

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
  durationMins?: number;
  rating?: string;
  posterUrl?: string;
  synopsis?: string;
  cast?: string;
  createdAt?: string;
  description?: string;
  releaseDate?: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  theatreName: string;
  showDate: string;
  showTime: string;
  ticketPrice: number;
  createdAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  createdAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  totalPrice: number;
  seatCodes: string[];
  movieTitle?: string;
  moviePoster?: string;
  theatreName?: string;
  showDate?: string;
  showTime?: string;
  customerName?: string;
  customerEmail?: string;
}

function getAuthToken(): string | null {
  const auth = localStorage.getItem('cinepass_auth');
  if (!auth) return null;
  try {
    const parsed = JSON.parse(auth);
    return parsed.token;
  } catch {
    return null;
  }
}

function getHeaders(includeAuth = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // --- AUTH ENDPOINTS ---
  auth: {
    register: async (email: string, name: string, password: string): Promise<{ token: string; user: User }> => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, name, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('cinepass_auth', JSON.stringify({ token: data.token, user: data.user }));
      }
      return data;
    },

    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('cinepass_auth', JSON.stringify({ token: data.token, user: data.user }));
      }
      return data;
    },

    logout: async (): Promise<void> => {
      localStorage.removeItem('cinepass_auth');
    },

    getCurrentUser: (): { token: string; user: User } | null => {
      const auth = localStorage.getItem('cinepass_auth');
      return auth ? JSON.parse(auth) : null;
    }
  },

  // --- MOVIES ENDPOINTS ---
  movies: {
    getAll: async (genre?: string): Promise<Movie[]> => {
      const url = genre && genre !== 'All' 
        ? `${API_BASE_URL}/movies?genre=${genre}`
        : `${API_BASE_URL}/movies`;
      const response = await fetch(url, { headers: getHeaders() });
      return handleResponse(response);
    },

    getById: async (id: string): Promise<Movie> => {
      const response = await fetch(`${API_BASE_URL}/movies/${id}`, { headers: getHeaders() });
      return handleResponse(response);
    },

    create: async (movieData: Omit<Movie, 'id' | 'createdAt'>): Promise<Movie> => {
      const response = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          title: movieData.title,
          description: movieData.description,
          genre: movieData.genre,
          releaseDate: movieData.releaseDate,
        }),
      });
      return handleResponse(response);
    },

    update: async (id: string, movieData: Partial<Omit<Movie, 'id' | 'createdAt'>>): Promise<Movie> => {
      const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({
          title: movieData.title,
          description: movieData.description,
          genre: movieData.genre,
          releaseDate: movieData.releaseDate,
        }),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    }
  },

  // --- SHOWTIMES ENDPOINTS ---
  showtimes: {
    getByMovieId: async (movieId: string): Promise<Showtime[]> => {
      const response = await fetch(`${API_BASE_URL}/showtimes/movie/${movieId}`, { headers: getHeaders() });
      return handleResponse(response);
    },

    getBookedSeats: async (showtimeId: string): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/showtimes/${showtimeId}/seats`, { headers: getHeaders() });
      return handleResponse(response);
    },

    create: async (showtimeData: Omit<Showtime, 'id' | 'createdAt'>): Promise<Showtime> => {
      const response = await fetch(`${API_BASE_URL}/showtimes`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          movieId: showtimeData.movieId,
          theatreName: showtimeData.theatreName,
          showDate: showtimeData.showDate,
          showTime: showtimeData.showTime,
          ticketPrice: showtimeData.ticketPrice,
        }),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/showtimes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    }
  },

  // --- BOOKINGS ENDPOINTS ---
  bookings: {
    create: async (userId: string, showtimeId: string, seatCodes: string[]): Promise<Booking> => {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          showtimeId,
          seatCodes,
        }),
      });
      return handleResponse(response);
    },

    getByUser: async (userId: string): Promise<Booking[]> => {
      const response = await fetch(`${API_BASE_URL}/bookings/mine`, { 
        headers: getHeaders(true)
      });
      return handleResponse(response);
    },

    getAll: async (): Promise<Booking[]> => {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        headers: getHeaders(true),
      });
      return handleResponse(response);
    },

    cancel: async (bookingId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    }
  }
};
