# CinePass Database Setup Guide

## Overview
The database is automatically initialized when the Spring Boot application starts. Hibernate will create all tables, and initial data will be seeded.

---

## 1. Database Configuration

### Development (H2 In-Memory/File)
**Profile:** `application-dev.yaml`
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/cinepass
    username: sa
    password: password
    driverClassName: org.h2.Driver
  h2:
    console:
      enabled: true
```

**Access H2 Console:** http://localhost:8080/h2-console

---

### Production (PostgreSQL)
**Profile:** `application.yaml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cinepass
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
```

---

### Docker (PostgreSQL in Container)
**Profile:** `application-docker.yaml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/cinepass
    username: cinepass
    password: cinepass
```

---

## 2. Automatic Data Initialization

### DataLoaderConfig
When the application starts, it automatically:
1. Checks if database is empty
2. Creates 3 users (1 admin + 2 regular users)
3. Creates 6 movies (various genres)
4. Creates 14 showtimes (tomorrow, day after, 3 days later)
5. Creates 2 sample bookings with seats
6. Logs test account credentials

### No Manual Setup Required!
Just start the backend:
```bash
mvn spring-boot:run
```

Output:
```
Loading initial data into database...
Created 3 users
Created 6 movies
Created 14 showtimes
Created 2 bookings with seats
Data loading completed successfully!
========================================
TEST ACCOUNTS:
Admin: admin@cinepass.com / admin123
User1: john@cinepass.com / john123
User2: jane@cinepass.com / jane123
========================================
```

---

## 3. Test Data Details

### Users
| Email | Password | Role |
|-------|----------|------|
| admin@cinepass.com | admin123 | Admin |
| john@cinepass.com | john123 | User |
| jane@cinepass.com | jane123 | User |

### Movies (6)
1. **Interstellar** (Sci-Fi) - Release: 2014-11-07
2. **The Lion King** (Animation) - Release: 2019-07-09
3. **Inception** (Sci-Fi) - Release: 2010-07-16
4. **The Dark Knight** (Action) - Release: 2008-07-18
5. **Avatar: The Way of Water** (Action) - Release: 2022-12-16
6. **Spirited Away** (Animation) - Release: 2001-07-20

### Showtimes (14 total)
Spread across:
- Tomorrow @ 14:00-21:00
- Day After Tomorrow @ 11:30-21:00
- 3 Days Later @ 14:00-19:00
- 4 Days Later @ 18:30

Different theatres:
- PVR Cinemas
- INOX Multiplex
- Cinepolis
- PVR IMAX
- INOX IMAX
- Cinepolis IMAX

Price range: ₹180 - ₹350

### Sample Bookings (2)
1. **Booking #1**
   - User: John Doe
   - Movie: Interstellar (Tomorrow @ 18:30 - PVR Cinemas)
   - Seats: A4, A5 (2 seats)
   - Total: ₹500

2. **Booking #2**
   - User: Jane Smith
   - Movie: The Lion King (Tomorrow @ 15:00 - INOX Multiplex)
   - Seats: C5 (1 seat)
   - Total: ₹200

---

## 4. Database Schema

### Tables Created Automatically

#### users
```sql
id (UUID) - Primary Key
email (VARCHAR) - Unique
password_hash (VARCHAR)
name (VARCHAR)
is_admin (BOOLEAN)
created_at (TIMESTAMP)
```

#### movies
```sql
id (UUID) - Primary Key
title (VARCHAR)
description (TEXT)
genre (VARCHAR)
release_date (DATE)
active (BOOLEAN)
created_at (TIMESTAMP)
```

#### showtimes
```sql
id (UUID) - Primary Key
movie_id (UUID) - Foreign Key → movies
theatre_name (VARCHAR)
show_date (DATE)
show_time (TIME)
ticket_price (NUMERIC)
created_at (TIMESTAMP)
```

#### bookings
```sql
id (UUID) - Primary Key
user_id (UUID) - Foreign Key → users
showtime_id (UUID) - Foreign Key → showtimes
total_price (NUMERIC)
status (VARCHAR) - CONFIRMED or CANCELLED
booked_at (TIMESTAMP)
cancelled_at (TIMESTAMP)
```

#### booking_seats
```sql
id (UUID) - Primary Key
booking_id (UUID) - Foreign Key → bookings
showtime_id (UUID) - Foreign Key → showtimes
seat_code (VARCHAR)
```

---

## 5. Reset Database

### Option 1: Delete Data File (H2)
```bash
rm -rf Backend/data/
```
Then restart the application.

### Option 2: Drop Tables (PostgreSQL)
```sql
DROP TABLE booking_seats;
DROP TABLE bookings;
DROP TABLE showtimes;
DROP TABLE movies;
DROP TABLE users;
```
Then restart the application.

### Option 3: Change Hibernate DDL Strategy
Temporarily change in `application.yaml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop  # This will drop and recreate on startup
```

---

## 6. Manual Data Seeding (Optional)

If you need to seed data manually, use the SQL script:

**File:** `Backend/src/main/resources/init-data.sql`

### Execute with PostgreSQL:
```bash
psql -U postgres -d cinepass -f Backend/src/main/resources/init-data.sql
```

### Execute with H2:
Can be executed through H2 console or via Spring's `@Sql` annotation in tests.

---

## 7. Verify Data via API

### Get All Movies
```bash
curl http://localhost:8080/api/movies
```

### Get Showtimes for a Movie
```bash
curl http://localhost:8080/api/showtimes/movie/{movieId}
```

### Login to Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@cinepass.com",
    "passwordHash": "john123"
  }'
```

### Get User's Bookings
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/api/bookings/mine
```

### Admin: Get All Bookings
```bash
curl -H "Authorization: Bearer {admin_token}" \
  http://localhost:8080/api/bookings
```

---

## 8. Swagger API Documentation

Once the backend is running:

**http://localhost:8080/swagger-ui.html**

All endpoints are documented with:
- Request parameters
- Response schemas
- Error codes
- Authentication requirements

---

## 9. Database Metrics (After Data Load)

After startup, database contains:
- **Users:** 3
- **Movies:** 6
- **Showtimes:** 14
- **Bookings:** 2
- **Booking Seats:** 3
- **Total Rows:** 28

---

## 10. Troubleshooting

### Issue: "Database connection refused"
**Solution:** Ensure PostgreSQL is running on port 5432

### Issue: "Table already exists"
**Solution:** This is normal with `ddl-auto: update`. It won't recreate existing tables.

### Issue: "Data not loading on startup"
**Solution:** Check if `DataLoaderConfig` is in the classpath and scanned by Spring.

### Issue: "H2 console not accessible"
**Solution:** Make sure you're using `application-dev.yaml` profile

---

## 11. Next Steps

1. ✅ Backend running → Data automatically loaded
2. ✅ Access Swagger UI → Test endpoints
3. ✅ Login with test account → Get JWT token
4. ✅ Browse movies → View showtimes
5. ✅ Make a booking → Test full workflow

You're all set!
