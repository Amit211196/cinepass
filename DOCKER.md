# CinePass Docker Setup

This runs the full CinePass stack:

- React frontend on `http://localhost:3000`
- Spring Boot backend on `http://localhost:8080`
- PostgreSQL on `localhost:5432`

## Start

```bash
docker compose up --build
```

## Stop

```bash
docker compose down
```

## Stop and remove database data

```bash
docker compose down -v
```

## Useful URLs

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8080
Swagger:  http://localhost:8080/swagger-ui.html
DB:       localhost:5432
```

Database credentials:

```text
Database: cinepass
Username: cinepass
Password: cinepass
```

The compose file also sets a development JWT secret:

```text
JWT_SECRET=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
```

Replace it before deploying anywhere real.

The frontend container also proxies `/api/*` requests to the backend container, so browser calls to `/api/bookings` will work from `http://localhost:3000`.
