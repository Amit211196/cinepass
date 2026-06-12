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

// Helper: Simulated delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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
export const api = {
  // --- AUTH ENDPOINTS ---
  auth: {
    register: async (email: string, name: string, passwordHash: string): Promise<User> => {
      await delay(400);
      const users = getStorage<any[]>(KEYS.USERS, []);
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: uuid(),
        email: email.toLowerCase(),
        password: passwordHash, // Store plain text/simulated BCrypt
        name,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      setStorage(KEYS.USERS, users);

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    },

    login: async (email: string, passwordHash: string): Promise<{ token: string; user: User }> => {
      await delay(400);
      const users = getStorage<any[]>(KEYS.USERS, []);
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === passwordHash
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const token = `jwt_mock_token_${uuid()}_${user.id}`;
      const { password, ...userWithoutPassword } = user;
      
      setStorage(KEYS.CURRENT_USER, { token, user: userWithoutPassword });
      return { token, user: userWithoutPassword };
    },

    logout: async (): Promise<void> => {
      await delay(200);
      localStorage.removeItem(KEYS.CURRENT_USER);
    },

    getCurrentUser: (): { token: string; user: User } | null => {
      return getStorage<{ token: string; user: User } | null>(KEYS.CURRENT_USER, null);
    }
  },

  // --- MOVIES ENDPOINTS ---
  movies: {
    getAll: async (genre?: string): Promise<Movie[]> => {
      await delay(300);
      const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      if (genre && genre !== 'All') {
        return movies.filter(m => m.genre.toLowerCase() === genre.toLowerCase());
      }
      return movies;
    },

    getById: async (id: string): Promise<Movie> => {
      await delay(200);
      const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      const movie = movies.find(m => m.id === id);
      if (!movie) {
        throw new Error('Movie not found');
      }
      return movie;
    },

    create: async (movieData: Omit<Movie, 'id' | 'createdAt'>): Promise<Movie> => {
      await delay(400);
      const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      const newMovie: Movie = {
        ...movieData,
        id: `movie-${uuid()}`,
        createdAt: new Date().toISOString(),
      };
      movies.push(newMovie);
      setStorage(KEYS.MOVIES, movies);
      return newMovie;
    },

    update: async (id: string, movieData: Partial<Omit<Movie, 'id' | 'createdAt'>>): Promise<Movie> => {
      await delay(400);
      const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      const index = movies.findIndex(m => m.id === id);
      if (index === -1) {
        throw new Error('Movie not found');
      }
      const updatedMovie = {
        ...movies[index],
        ...movieData,
      };
      movies[index] = updatedMovie;
      setStorage(KEYS.MOVIES, movies);
      return updatedMovie;
    },

    delete: async (id: string): Promise<void> => {
      await delay(300);
      let movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      movies = movies.filter(m => m.id !== id);
      setStorage(KEYS.MOVIES, movies);

      // Cascade delete: clean up showtimes and bookings for this movie
      let showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
      const showtimeIdsToDelete = showtimes.filter(s => s.movieId === id).map(s => s.id);
      showtimes = showtimes.filter(s => s.movieId !== id);
      setStorage(KEYS.SHOWTIMES, showtimes);

      let bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      bookings = bookings.filter(b => !showtimeIdsToDelete.includes(b.showtimeId));
      setStorage(KEYS.BOOKINGS, bookings);
    }
  },

  // --- SHOWTIMES ENDPOINTS ---
  showtimes: {
    getByMovieId: async (movieId: string): Promise<Showtime[]> => {
      await delay(250);
      const showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
      return showtimes.filter(s => s.movieId === movieId);
    },

    getBookedSeats: async (showtimeId: string): Promise<string[]> => {
      await delay(200);
      const bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      // Active confirmed bookings only
      const activeBookings = bookings.filter(b => b.showtimeId === showtimeId && b.status === 'CONFIRMED');
      const bookedSeats: string[] = [];
      activeBookings.forEach(b => {
        bookedSeats.push(...b.seatCodes);
      });
      return bookedSeats;
    },

    create: async (showtimeData: Omit<Showtime, 'id' | 'createdAt'>): Promise<Showtime> => {
      await delay(400);
      const showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
      const newShowtime: Showtime = {
        ...showtimeData,
        id: `st-${uuid()}`,
        createdAt: new Date().toISOString(),
      };
      showtimes.push(newShowtime);
      setStorage(KEYS.SHOWTIMES, showtimes);
      return newShowtime;
    },

    delete: async (id: string): Promise<void> => {
      await delay(300);
      let showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
      showtimes = showtimes.filter(s => s.id !== id);
      setStorage(KEYS.SHOWTIMES, showtimes);

      // Cascade delete bookings for this showtime
      let bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      bookings = bookings.filter(b => b.showtimeId !== id);
      setStorage(KEYS.BOOKINGS, bookings);
    }
  },

  // --- BOOKINGS ENDPOINTS ---
  bookings: {
    create: async (userId: string, showtimeId: string, seatCodes: string[]): Promise<Booking> => {
      await delay(500);
      
      // Verify seat availability first
      const bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      const activeBookingsForShowtime = bookings.filter(
        b => b.showtimeId === showtimeId && b.status === 'CONFIRMED'
      );
      
      const alreadyBooked: string[] = [];
      activeBookingsForShowtime.forEach(b => {
        seatCodes.forEach(sc => {
          if (b.seatCodes.includes(sc)) {
            alreadyBooked.push(sc);
          }
        });
      });

      if (alreadyBooked.length > 0) {
        throw new Error(`Seats ${alreadyBooked.join(', ')} are already booked!`);
      }

      // Fetch showtime to calculate price
      const showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
      const showtime = showtimes.find(s => s.id === showtimeId);
      if (!showtime) {
        throw new Error('Showtime not found');
      }

      const newBooking: Booking = {
        id: `CP-${Math.floor(100000 + Math.random() * 900000)}`, // Standard Booking ID format
        userId,
        showtimeId,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        totalPrice: showtime.ticketPrice * seatCodes.length,
        seatCodes,
      };

      bookings.push(newBooking);
      setStorage(KEYS.BOOKINGS, bookings);
      return newBooking;
    },

    getByUser: async (userId: string): Promise<Booking[]> => {
      await delay(300);
      const bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      const userBookings = bookings.filter(b => b.userId === userId);
      
      // Enrich booking data
      const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      const showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);

      return userBookings.map(b => {
        const showtime = showtimes.find(s => s.id === b.showtimeId);
        const movie = showtime ? movies.find(m => m.id === showtime.movieId) : null;
        
        return {
          ...b,
          movieTitle: movie?.title || 'Unknown Movie',
          moviePoster: movie?.posterUrl || '',
          theatreName: showtime?.theatreName || 'Unknown Theatre',
          showDate: showtime?.showDate || '',
          showTime: showtime?.showTime || '',
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getAll: async (): Promise<Booking[]> => {
      await delay(300);
      const bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      const movies = getStorage<Movie[]>(KEYS.MOVIES, []);
      const showtimes = getStorage<Showtime[]>(KEYS.SHOWTIMES, []);
      const users = getStorage<any[]>(KEYS.USERS, []);

      return bookings.map(b => {
        const showtime = showtimes.find(s => s.id === b.showtimeId);
        const movie = showtime ? movies.find(m => m.id === showtime.movieId) : null;
        const userObj = users.find(u => u.id === b.userId);
        
        return {
          ...b,
          movieTitle: movie?.title || 'Unknown Movie',
          moviePoster: movie?.posterUrl || '',
          theatreName: showtime?.theatreName || 'Unknown Theatre',
          showDate: showtime?.showDate || '',
          showTime: showtime?.showTime || '',
          customerName: userObj?.name || 'Guest User',
          customerEmail: userObj?.email || 'N/A',
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    cancel: async (bookingId: string): Promise<void> => {
      await delay(300);
      const bookings = getStorage<Booking[]>(KEYS.BOOKINGS, []);
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
      booking.status = 'CANCELLED';
      // Alternatively delete or just mark status to free seats
      // Let's filter it out or change status.
      // If we mark as 'CANCELLED', does it free the seats?
      // Yes, in getBookedSeats we check for status === 'CONFIRMED' only!
      setStorage(KEYS.BOOKINGS, bookings);
    }
  }
};
