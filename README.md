# Sangam Event Portal

> A production-quality institution event management web application built for the Parrophins Private Limited technical assessment.

Students can browse college events and register for them. Administrators manage events, view registrations, and monitor dashboard statistics.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies Used](#3-technologies-used)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Database & Environment Variables](#6-database--environment-variables)
7. [Running Locally (XAMPP + Vite)](#7-running-locally-xampp--vite)
8. [API Endpoint Documentation](#8-api-endpoint-documentation)
9. [Database Schema Overview](#9-database-schema-overview)
10. [Design Decisions](#10-design-decisions)
11. [Known Limitations & Future Improvements](#11-known-limitations--future-improvements)
12. [Deployment](#12-deployment)
13. [AI Usage Disclosure](#13-ai-usage-disclosure)

---

## 1. Project Overview

**Sangam Event Portal** is a full-stack web application that helps college institutions manage events and allows students to discover and register for them.

- **Student side** — Browse all events, filter by status, view full event details, and register with name, email, and phone.
- **Admin side** — Secure login, dashboard statistics, full CRUD for events, and per-event registration management with search.

---

## 2. Features

### User Features
- Event listing with card grid: title, description, date, venue, image, status badge
- Status is **computed dynamically** (never stored): `Upcoming`, `Past`, or `Registration Closed`
- Event detail page with meta grid and sticky registration form
- Registration form with client-side + server-side validation
- Duplicate-registration detection (unique email per event, HTTP 409)
- Registration blocked for past events, after deadline, or when capacity is full
- Clear success message with reset option; inline field errors

### Admin Features
- JWT-style HMAC token auth (stateless, 24h expiry)
- Dashboard: total events, total registrations, upcoming count, avg. registrations/event, recent activity feed
- Full CRUD for events with image URL preview in form
- Delete confirmation modal (shows registration count that will cascade-delete)
- Registration management: event selector, debounced live search, total + filtered count

### UI/UX
- Dark mode design system (CSS custom properties)
- Responsive mobile-first layout (breakpoints at 480/640/700/900px)
- Glassmorphism navbar with mobile hamburger menu
- Animated event cards with hover lift effect
- Loading spinners, empty states, and accessible alerts on all async operations
- Accessible forms: `<label>`, `aria-invalid`, `aria-describedby`, `role="alert"`

---

## 3. Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite 5, Vanilla CSS |
| Backend | PHP 8.2, PDO with prepared statements |
| Database | MySQL 8 |
| Auth | Stateless HMAC-SHA256 token (no session, no library) |
| Hosting | Vercel (frontend) + Render Docker (backend) |
| Fonts | Google Fonts — Inter + Outfit |

---

## 4. Prerequisites

- **XAMPP** (PHP 8+ and MySQL) — [download](https://www.apachefriends.org/)
- **Node.js 18+** and **npm** — [download](https://nodejs.org/)
- **Git** — [download](https://git-scm.com/)
- A browser (Chrome, Firefox, Edge)

---

## 5. Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/event-app.git
cd event-app

# 2. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 6. Database & Environment Variables

### Database Setup

1. Start XAMPP and open **phpMyAdmin** (`http://localhost/phpmyadmin`)
2. Create a database named `event_app` (UTF-8 Unicode)
3. Import `database/schema.sql` — this creates all tables and seeds 6 sample events

### Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=event_app
DB_USER=root
DB_PASS=               # your XAMPP MySQL password (often blank)
APP_SECRET=your-long-random-secret-here
ALLOWED_ORIGIN=http://localhost:5173
```

> **Generate a strong secret:**
> ```bash
> php -r "echo bin2hex(random_bytes(32));"
> ```

### Admin User Setup

Run the setup script once to insert the hashed admin password:

```bash
php setup_admin.php
```

Default credentials: `admin@college.edu` / `Admin@123`

> ⚠️ **Change the password** in `setup_admin.php` before using in production.

---

## 7. Running Locally (XAMPP + Vite)

### Backend (XAMPP)

1. Copy the `event-app` folder into `C:\xampp\htdocs\`  
   → Backend accessible at `http://localhost/event-app/backend/api/`
2. Ensure Apache and MySQL are running in XAMPP Control Panel
3. The `.env` file at `event-app/.env` is loaded automatically by `backend/config/db.php`

### Frontend (Vite)

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`

> The Vite dev server proxies `/api` requests to `http://localhost/event-app/backend/api` automatically (configured in `vite.config.js`).

---

## 8. API Endpoint Documentation

All endpoints return `application/json`. Auth-required endpoints need `Authorization: Bearer <token>`.

### Public Endpoints

#### `GET /api/events.php`
List all events with computed status and registration count.
- **Response 200:** Array of event objects
- Each event includes `status`, `registration_count`, `capacity`

#### `GET /api/events.php?id={id}`
Get single event by ID.
- **Response 200:** Event object
- **Response 404:** `{ "error": "Event not found" }`

#### `POST /api/register.php`
Register a student for an event.
- **Body:** `{ "event_id": 1, "name": "Priya Sharma", "email": "priya@college.edu", "phone": "9876543210" }`
- **Response 201:** `{ "message": "Registration successful!", "registration": {...} }`
- **Response 409:** `{ "error": "You are already registered for this event" }`
- **Response 422:** Validation errors (past event, closed, full, invalid email/phone)

### Admin Endpoints (Auth Required)

#### `POST /api/login.php`
Admin login.
- **Body:** `{ "email": "admin@college.edu", "password": "Admin@123" }`
- **Response 200:** `{ "token": "...", "admin": { "id": 1, "email": "..." } }`
- **Response 401:** Invalid credentials

#### `GET /api/stats.php`
Dashboard statistics.
- **Response 200:** `{ "total_events": 6, "total_registrations": 12, "upcoming_events": 4, "recent_registrations": [...] }`

#### `POST /api/events.php`
Create a new event.
- **Body:** `{ "title", "description", "event_date", "venue", "image_url"?, "capacity"?, "registration_deadline"? }`
- **Response 200:** Created event object
- **Response 422:** Validation error

#### `PUT /api/events.php?id={id}`
Update an event.
- **Body:** Same as POST
- **Response 200:** Updated event object

#### `DELETE /api/events.php?id={id}`
Delete an event (and all its registrations via CASCADE).
- **Response 200:** `{ "message": "Event deleted successfully" }`

#### `GET /api/registrations.php?event_id={id}[&search=...]`
List registrations for an event with optional search.
- **Response 200:** `{ "event": {...}, "total_count": 10, "filtered_count": 3, "registrations": [...] }`

---

## 9. Database Schema Overview

### `events`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED AUTO_INCREMENT PK | |
| title | VARCHAR(255) | |
| description | TEXT | |
| event_date | DATETIME | |
| venue | VARCHAR(255) | |
| image_url | VARCHAR(512) NULL | External URL |
| capacity | INT UNSIGNED NULL | NULL = unlimited |
| registration_deadline | DATETIME NULL | NULL = no deadline |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `registrations`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED AUTO_INCREMENT PK | |
| event_id | INT UNSIGNED FK | → events(id) ON DELETE CASCADE |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **UNIQUE** | (event_id, email) | Prevents duplicate registration |

### `admins`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED AUTO_INCREMENT PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt via password_hash() |
| created_at | TIMESTAMP | |

---

## 10. Design Decisions

### Registration Cascade Delete
When an admin deletes an event, all associated registrations are **permanently deleted** via `ON DELETE CASCADE` on the foreign key. This was chosen over soft-delete or orphan-preservation because:
- It keeps the database clean and consistent
- Orphaned registrations (no event) serve no business purpose
- Admins are warned with the registration count in the confirmation modal before deleting

### Stateless Token Auth
Admin authentication uses a stateless HMAC-SHA256 signed token (similar to JWT but without a library). This avoids session state on the server, making the API compatible with Docker and multi-instance deployments.

### Status Computed Server-Side
Event status (`Upcoming`, `Past`, `Registration Closed`) is always computed by the PHP API from the current time, deadline, and capacity — never stored. This guarantees correctness across timezones and caching scenarios.

### Image URLs vs File Upload
Events store an `image_url` string (external URL). File upload is listed as a future improvement to keep v1 simple and avoid needing file storage infrastructure.

---

## 11. Known Limitations & Future Improvements

| Limitation | Future Improvement |
|---|---|
| Token stored in `localStorage` (XSS-vulnerable) | Switch to `httpOnly` cookies with SameSite=Strict |
| No image upload — URL only | Add file upload with cloud storage (Cloudinary/S3) |
| No email confirmation after registration | Add PHP Mailer / SMTP integration |
| No pagination on registrations | Add cursor-based or offset pagination for large datasets |
| Single admin account | Multi-admin support with roles |
| No event categories/tags | Add filtering by category |
| No rate limiting on registration | Add IP-based rate limiting |

---

## 12. Deployment

### Frontend → Vercel

1. Push the repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend/`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. The `frontend/vercel.json` already handles React Router SPA rewrites

### Backend → Render (Docker)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your repository
3. Set **Root Directory** to `backend/`
4. Set **Dockerfile Path** to `Dockerfile`
5. Add environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` (from your MySQL host)
   - `APP_SECRET` (a strong random string)
   - `ALLOWED_ORIGIN` (your Vercel frontend URL)

### Database → External MySQL

For production, host MySQL externally:
- [PlanetScale](https://planetscale.com) (serverless MySQL)
- [Railway](https://railway.app) (MySQL plugin)
- [Aiven](https://aiven.io) (managed MySQL)

> ⚠️ **Note on free-tier cold starts:** Render free-tier services spin down after 15 minutes of inactivity. The first request after a cold start may take 30–60 seconds. Consider a paid tier or a keep-alive ping for production use.

---

## 13. AI Usage Disclosure

Parts of this project were generated with an AI tool (Google Deepmind's Antigravity) and reviewed and tested by me. All generated code was understood, verified against requirements, and adapted as needed before submission.
