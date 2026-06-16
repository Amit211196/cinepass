-- CinePass PostgreSQL Database Schema & Initial Data
-- This script initializes the database for CinePass cinema booking system

-- ============================================
-- 1. CREATE DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS cinepass;

-- ============================================
-- 2. CREATE TABLES (Hibernates will auto-create with ddl-auto:update, but here's the schema)
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Showtimes Table
CREATE TABLE IF NOT EXISTS showtimes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    theatre_name VARCHAR(120) NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    ticket_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
    total_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL
);

-- Booking Seats Table
CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
    seat_code VARCHAR(10) NOT NULL
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_showtimes_movie_id ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_show_date ON showtimes(show_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_id ON bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id ON booking_seats(booking_id);

-- ============================================
-- 4. SEED TEST DATA
-- ============================================

-- Users: 1 Admin + 2 Regular Users
INSERT INTO users (id, email, password_hash, name, is_admin) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@cinepass.com', '$2a$12$s9qJ0c2Z5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e', 'Admin User', TRUE),
    ('550e8400-e29b-41d4-a716-446655440002', 'john@cinepass.com', '$2a$12$s9qJ0c2Z5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e', 'John Doe', FALSE),
    ('550e8400-e29b-41d4-a716-446655440003', 'jane@cinepass.com', '$2a$12$s9qJ0c2Z5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e5d5e', 'Jane Smith', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Movies: 6 Movies with different genres
INSERT INTO movies (id, title, description, genre, release_date, active) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Interstellar', 'A team of explorers travel through a wormhole in space', 'SCI_FI', '2014-11-07', TRUE),
    ('650e8400-e29b-41d4-a716-446655440002', 'The Lion King', 'A young lion prince flees his kingdom after his father death', 'ANIMATION', '2019-07-09', TRUE),
    ('650e8400-e29b-41d4-a716-446655440003', 'Inception', 'A thief who steals corporate secrets through dream-sharing technology', 'SCI_FI', '2010-07-16', TRUE),
    ('650e8400-e29b-41d4-a716-446655440004', 'The Dark Knight', 'Batman must accept psychological and physical tests to fight injustice', 'ACTION', '2008-07-18', TRUE),
    ('650e8400-e29b-41d4-a716-446655440005', 'Avatar: The Way of Water', 'Jake Sully and family on the planet Pandora facing familiar threats', 'ACTION', '2022-12-16', TRUE),
    ('650e8400-e29b-41d4-a716-446655440006', 'Spirited Away', 'A girl enters a magical world of gods, witches and spirits', 'ANIMATION', '2001-07-20', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Showtimes: 10+ showtimes for various movies across different dates and times
INSERT INTO showtimes (id, movie_id, theatre_name, show_date, show_time, ticket_price) VALUES
    -- Interstellar
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'PVR Cinemas', '2026-06-16', '18:30', 250.00),
    ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'INOX Multiplex', '2026-06-17', '21:00', 280.00),
    ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Cinepolis', '2026-06-18', '14:00', 220.00),
    
    -- The Lion King
    ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'INOX Multiplex', '2026-06-16', '15:00', 200.00),
    ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'Cinepolis', '2026-06-17', '11:30', 180.00),
    ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'PVR Cinemas', '2026-06-18', '19:00', 210.00),
    
    -- Inception
    ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440003', 'PVR Cinemas', '2026-06-16', '20:45', 250.00),
    ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440003', 'INOX Multiplex', '2026-06-17', '16:30', 240.00),
    
    -- The Dark Knight
    ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', 'Cinepolis IMAX', '2026-06-16', '17:15', 350.00),
    ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440004', 'PVR IMAX', '2026-06-17', '20:00', 340.00),
    
    -- Avatar: The Way of Water
    ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440005', 'PVR IMAX', '2026-06-18', '14:00', 320.00),
    ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440005', 'INOX IMAX', '2026-06-19', '18:30', 300.00),
    
    -- Spirited Away
    ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440006', 'INOX Multiplex', '2026-06-16', '12:00', 190.00),
    ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440006', 'Cinepolis', '2026-06-17', '13:00', 185.00)
ON CONFLICT (id) DO NOTHING;

-- Sample Bookings (2 confirmed bookings with seats)
INSERT INTO bookings (id, user_id, showtime_id, total_price, status, booked_at) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 500.00, 'CONFIRMED', CURRENT_TIMESTAMP),
    ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440004', 200.00, 'CONFIRMED', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Sample Booking Seats
INSERT INTO booking_seats (id, booking_id, showtime_id, seat_code) VALUES
    ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'A4'),
    ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'A5'),
    ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440004', 'C5')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. VERIFY DATA
-- ============================================
SELECT 'Users Count: ' || COUNT(*) FROM users;
SELECT 'Movies Count: ' || COUNT(*) FROM movies;
SELECT 'Showtimes Count: ' || COUNT(*) FROM showtimes;
SELECT 'Bookings Count: ' || COUNT(*) FROM bookings;
