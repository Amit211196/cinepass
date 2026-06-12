# CinePass Backend API & Database Specification
This document establishes the exact integration contract between the **React + Vite Frontend** and the **Spring Boot + PostgreSQL Backend**.

---

## 1. CORS Configuration (Spring Boot)
The React application runs locally on `http://localhost:5173`. The backend must allow CORS requests on all controllers:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

---

## 2. Authentication Protocol
All protected routes require a JWT token sent in the HTTP headers:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 3. Database Schema (PostgreSQL DDL)
Run these commands to initialize the PostgreSQL database:

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Movies Table
CREATE TABLE movies (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    duration_mins INT NOT NULL,
    rating VARCHAR(10) NOT NULL,
    poster_url VARCHAR(500) NOT NULL,
    synopsis TEXT NOT NULL,
    cast_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Showtimes Table
CREATE TABLE showtimes (
    id VARCHAR(50) PRIMARY KEY,
    movie_id VARCHAR(50) REFERENCES movies(id) ON DELETE CASCADE,
    theatre_name VARCHAR(100) NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings Table
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    showtime_id VARCHAR(50) REFERENCES showtimes(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED', -- 'CONFIRMED' or 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Booking Seats Table (As required: Track booked seats via BookingSeat rows per showtime)
CREATE TABLE booking_seats (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    showtime_id VARCHAR(50) REFERENCES showtimes(id) ON DELETE CASCADE,
    seat_code VARCHAR(10) NOT NULL
);
```

---

## 4. JPA Models (Java)

### `User.java`
```java
package com.cinepass.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash; // Hashed with BCrypt
    
    private String name;
    
    @Column(name = "is_admin")
    private boolean isAdmin = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### `Movie.java`
```java
package com.cinepass.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {
    @Id
    private String id;
    private String title;
    private String genre;
    
    @Column(name = "duration_mins")
    private int durationMins;
    
    private String rating;
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(columnDefinition = "TEXT")
    private String synopsis;
    
    @Column(name = "cast_text", columnDefinition = "TEXT")
    private String castText;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### `Showtime.java`
```java
package com.cinepass.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Showtime {
    @Id
    private String id;
    
    @Column(name = "movie_id")
    private String movieId;
    
    @Column(name = "theatre_name")
    private String theatreName;
    
    @Column(name = "show_date")
    private LocalDate showDate;
    
    @Column(name = "show_time")
    private LocalTime showTime;
    
    @Column(name = "ticket_price")
    private double ticketPrice;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### `Booking.java`
```java
package com.cinepass.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    private String id; // Format: CP-XXXXXX
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "showtime_id")
    private String showtimeId;
    
    @Column(name = "total_price")
    private double totalPrice;
    
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### `BookingSeat.java`
```java
package com.cinepass.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingSeat {
    @Id
    private String id;
    
    @Column(name = "booking_id")
    private String bookingId;
    
    @Column(name = "showtime_id")
    private String showtimeId;
    
    @Column(name = "seat_code")
    private String seatCode;
}
```

---

## 5. Request & Response DTOs (Java)

### `RegisterRequest.java`
```java
package com.cinepass.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String name;
    private String password;
}
```

### `LoginRequest.java`
```java
package com.cinepass.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
```

### `LoginResponse.java`
```java
package com.cinepass.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserResponse user;
}
```

### `UserResponse.java`
```java
package com.cinepass.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String name;
    private boolean isAdmin;
    private LocalDateTime createdAt;
}
```

### `BookingRequest.java`
```java
package com.cinepass.dto;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private String showtimeId;
    private List<String> seatCodes;
}
```

### `UserBookingResponse.java` (Enriched Booking details)
```java
package com.cinepass.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserBookingResponse {
    private String id;
    private String userId;
    private String showtimeId;
    private String status;
    private double totalPrice;
    private List<String> seatCodes;
    private LocalDateTime createdAt;
    
    // Joined details needed by frontend
    private String movieTitle;
    private String moviePoster;
    private String theatreName;
    private String showDate;
    private String showTime;
}
```

### `AdminBookingResponse.java` (Enriched Booking details)
```java
package com.cinepass.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminBookingResponse {
    private String id;
    private String userId;
    private String showtimeId;
    private String status;
    private double totalPrice;
    private List<String> seatCodes;
    private LocalDateTime createdAt;
    
    // Joined details needed by frontend
    private String movieTitle;
    private String theatreName;
    private String showDate;
    private String showTime;
    private String customerName;
    private String customerEmail;
}
```

---

## 6. Endpoints Contract (1-to-1 matching with Frontend calls)

### 🔑 Auth Controller (`POST /api/auth`)
1.  **`POST /api/auth/register`**
    *   *Request Body*: `RegisterRequest` DTO
    *   *Response (`201 Created`)*: `UserResponse` DTO
2.  **`POST /api/auth/login`**
    *   *Request Body*: `LoginRequest` DTO
    *   *Response (`200 OK`)*: `LoginResponse` DTO
3.  **`POST /api/auth/logout`**
    *   *Response (`204 No Content`)*: Empty

---

### 🎬 Movie Controller (`/api/movies`)
1.  **`GET /api/movies`**
    *   *Query Parameters*: `?genre=Sci-Fi` (Optional)
    *   *Response (`200 OK`)*: `List<Movie>`
2.  **`GET /api/movies/{id}`**
    *   *Response (`200 OK`)*: `Movie` object
3.  **`POST /api/movies`** (Admin Only)
    *   *Request Body*: `Movie` object (without id or createdAt)
    *   *Response (`201 Created`)*: Created `Movie` object
4.  **`PUT /api/movies/{id}`** (Admin Only)
    *   *Request Body*: Updated `Movie` details
    *   *Response (`200 OK`)*: Updated `Movie` object
5.  **`DELETE /api/movies/{id}`** (Admin Only)
    *   *Response (`204 No Content`)*: Empty

---

### 🕒 Showtime Controller (`/api`)
1.  **`GET /api/movies/{movieId}/showtimes`**
    *   *Response (`200 OK`)*: `List<Showtime>`
2.  **`GET /api/showtimes/{showtimeId}/seats`**
    *   *Response (`200 OK`)*: `List<String>` (e.g. `["A4", "A5"]` of booked seats)
    *   *SQL helper logic*:
        ```sql
        SELECT bs.seat_code FROM booking_seats bs 
        JOIN bookings b ON bs.booking_id = b.id 
        WHERE bs.showtime_id = :showtimeId AND b.status = 'CONFIRMED'
        ```
3.  **`POST /api/showtimes`** (Admin Only)
    *   *Request Body*: `Showtime` object (without id or createdAt)
    *   *Response (`201 Created`)*: Created `Showtime` object
4.  **`DELETE /api/showtimes/{id}`** (Admin Only)
    *   *Response (`204 No Content`)*: Empty

---

### 🎟️ Booking Controller (`/api/bookings`)
1.  **`POST /api/bookings`** (Protected)
    *   *Request Body*: `BookingRequest` DTO
    *   *Validation logic*: Verify that **none** of the requested `seatCodes` are already booked (`status = 'CONFIRMED'`) for that showtime. If any are booked, return `409 Conflict`.
    *   *Response (`201 Created`)*: Created `Booking` object
2.  **`GET /api/bookings/mine`** (Protected)
    *   *Response (`200 OK`)*: `List<UserBookingResponse>` (Enriched with movie and showtime details)
3.  **`GET /api/bookings`** (Admin Only)
    *   *Response (`200 OK`)*: `List<AdminBookingResponse>` (Enriched with movie, showtime, and customer profile details)
4.  **`DELETE /api/bookings/{id}`** (Protected)
    *   *Action*: Cancels booking. Changes status to `'CANCELLED'`.
    *   *Response (`204 No Content`)*: Empty
