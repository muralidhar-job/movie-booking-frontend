# CineBook — B2C Customer Portal (React 18 + Vite)

> React frontend for the CineBook movie ticket booking platform.
> Connects to the Spring Boot API Gateway on port 8080.

---

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

> **Note:** All `/api` calls are proxied to `http://localhost:8080` (Spring Boot API Gateway).
> If the backend is not running, mock data is displayed so the UI works standalone.

---

## Pages

| Route | Page | Backend API |
|---|---|---|
| `/login` | Login | `POST /api/v1/auth/login` |
| `/register` | Register | `POST /api/v1/auth/register` |
| `/movies` | Browse Movies | `GET /api/v1/movies?city=&language=&genre=` |
| `/movies/:id/shows` | Show Listings | `GET /api/v1/movies/{id}/shows?city=&date=` |
| `/booking/:showId` | Seat Selection | `POST /api/v1/bookings` |
| `/my-bookings` | My Bookings | `GET /api/v1/bookings/my` |
| `/offers` | Offers | `GET /api/v1/offers` |
| `/admin/dashboard` | Admin Dashboard | `GET /api/v1/theatres/{id}/shows` |
| `/admin/shows` | Manage Shows | `POST/DELETE /api/v1/theatres/{id}/shows` |

---

## User Roles

| Role | What they see |
|---|---|
| `CUSTOMER` | Browse movies → select show → pick seats → pay → view bookings |
| `THEATRE_ADMIN` | Admin dashboard → manage shows (redirected to React admin pages) |

> **Note:** Theatre admins can also use the Thymeleaf portal at `http://localhost:8085/admin`
> for a richer server-side admin experience.

---

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx     JWT token + user role stored in localStorage
├── services/
│   └── api.js              Axios instance — JWT interceptor + all API methods
├── components/
│   └── common/
│       └── Navbar.jsx      Role-aware navigation bar
└── pages/
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── MoviesPage.jsx       Grid of movie cards with filters
    ├── ShowsPage.jsx        Show timings with afternoon offer highlight
    ├── BookingPage.jsx      Visual seat map (REGULAR/PREMIUM/RECLINER)
    ├── MyBookingsPage.jsx   Booking history with cancel option
    ├── OffersPage.jsx       Active platform offers
    └── admin/
        ├── AdminDashboard.jsx  Stats + shows table
        └── AdminShows.jsx      Create / cancel shows form
```

---

## Available Offer Codes

| Code | Discount |
|---|---|
| `THIRD50` | 50% off on the 3rd ticket (min 3 tickets) |
| `AFTERNOON20` | 20% off all tickets for shows between 12:00–17:00 |

---

## Scripts

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Build for production → dist/
npm run preview  # Preview production build
```
