# CinePass Movie Ticket Booking (Frontend)

CinePass is a premium, modern movie ticket booking web application built using **React + Vite + TypeScript** and styled using **Vanilla CSS**.

Since this is a frontend-only implementation, we have built a **fully functional asynchronous mock API layer** that uses `localStorage` for database operations. Your registrations, logins, seat selections, and admin modifications are persisted and survive page reloads!

---

## 🌟 Key Features Built

1. **Authentication & Session Management**:
   - Register new user accounts or login to existing profiles.
   - Dynamic UI states based on role context (`isAdmin`).
   - Secure route protection (prevents guest access to booking confirmations and locks down the Admin panel).

2. **Movie Catalog**:
   - Dynamic grid displaying seeded movie poster cards, durations, genres, and ratings.
   - Real-time **search filter** for matching movie titles or genres.
   - **Genre chips** to filter catalog list dynamically (Sci-Fi, Action, Animation, etc.).

3. **Detail Page & Grouped Showtimes**:
   - Dynamic movie summaries and cast lists.
   - Active showtimes grouped automatically by theatre locations (PVR, INOX, Cinepolis, etc.).

4. **Seat Selection Grid**:
   - Interactive **5x10 seating grid** (Rows A-E, seats 1-10 = 50 total).
   - Occupied seats are automatically disabled and highlighted in Red.
   - Multi-seat selection (1-6 tickets per transaction) represented in Purple.
   - Live invoice calculations showing ticket details, prices, and totals.

5. **Booking Engine & Confirmation**:
   - Detailed invoice summaries (Movie, Theatre, Date, Time, Seat Numbers, Total Price).
   - Confirms booking, generates a unique confirmation invoice ID (e.g. `CP-829107`), and locks down the selected seats.
   - Print view stylesheet allowing clean receipt printing (`window.print()` / Ctrl+P).

6. **My Bookings Dashboard**:
   - Shows active and cancelled booking histories.
   - **Live Countdown Timer**: Counts down to showtime in real-time (e.g., `Starts in 04h 23m 12s` or `Starts in 2 days`).
   - **Reservation Cancellation**: Cancelling tickets updates statuses immediately and releases the seat locks.

7. **Admin CRUD Operations**:
   - **Movies Tab**: Form modals to add, edit details, or delete movies.
   - **Showtimes Tab**: Add new showtimes selecting from existing movies, theatres, date-time slots, and pricing.
   - Cascading deletions (deleting movies or showtimes automatically cancels dependent bookings and frees seat locks).

---

## 🔑 Test Credentials

The database initializes with these default accounts:

### 1. Admin Account
- **Email**: `admin@cinepass.com`
- **Password**: `admin123`
- *Access*: Full CRUD permissions for movies/showtimes via the Admin Panel tab in the navigation bar.

### 2. Standard Customer Account
- **Email**: `user@cinepass.com`
- **Password**: `user123`
- *Access*: Standard browsing, seat booking, ticket tracking, and cancellation.

*Note: You can also register a new user using the registration tab on the login page.*

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open the local address printed in the console (usually `http://localhost:5173`) in your browser.

### 3. Build for Production
```bash
npm run build
```
This builds and bundles assets into the `dist/` directory, verifying that all strict TypeScript checks compile successfully.
