# Streamora — Full‑Stack Video Streaming App

Streamora is a full‑stack video streaming platform I built to learn **real backend patterns** (not just “make APIs work”).

It’s built as a clean Express backend (routes → controllers → models) with production‑minded middleware (auth, CORS, Helmet, rate limiting, uploads), and a React + Vite SPA frontend with service layers, Zustand state, and infinite scrolling.

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Auth: JWT (cookies + `Authorization: Bearer <token>`)
- Uploads: Multer (local temp) → Cloudinary (with cleanup)
- Security: Helmet, CORS allowlist + credentials, rate limiting

**Frontend**
- React + Vite
- React Router (SPA)
- Axios service layer
- Zustand state management
- Intersection Observer (infinite feed)

## Key Backend Patterns (What I Learned)

- **Layered structure**: routes define API surface, controllers hold business logic, models handle DB.
- **Middlewares as first‑class citizens**: JWT auth, request flow control, and file uploads.
- **Consistent API contract**: centralized `ApiResponse` / `ApiError`, `asyncHandler`, and a global error handler.
- **Production basics**: CORS allowlist + credentials, Helmet headers, rate limiting.
- **Real upload pipeline**: Multer → local temp → Cloudinary with failure cleanup + Multer error handling.

## Features (High Level)

- Authentication with access/refresh token flow
- Video upload + streaming/playback
- Comments, likes
- Playlists
- Subscriptions
- Creator dashboard
- Notifications
- Tweets/community posts
- AI endpoints (Gemini integration)

## API

**Base URL (local):** `http://localhost:8000/api/v1`

Mounted route groups:
- `/healthcheck`
- `/users`
- `/videos`
- `/comments`
- `/likes`
- `/playlists`
- `/subscriptions`
- `/tweets`
- `/dashboard`
- `/notifications`
- `/ai`

## Environment Variables

### Backend (`Backend/.env`)

Required:
- `MONGODB_URI` — Mongo connection string (database name is appended internally)
- `PORT` — server port (defaults to `8000`)
- `CORS_ORIGIN` — additional allowed origin (optional, see CORS section)
- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:
- `NODE_ENV` — `development` / `production`
- `GEMINI_API_KEY` — required only if using AI routes

### Frontend (`frontend/Streamora/.env`)

- `VITE_API_URL` — API base URL (default fallback is `http://localhost:8000/api/v1`)

Example:
```bash
VITE_API_URL=http://localhost:8000/api/v1
```

## Local Development

### 1) Backend
```bash
cd Backend
npm install
npm run dev
```
Backend runs on `http://localhost:8000` by default.

### 2) Frontend
```bash
cd frontend/Streamora
npm install
npm run dev
```
Vite dev server defaults to `http://localhost:5173`.

## CORS + Cookies (Important)

The backend is configured with **CORS credentials enabled**, so cookies can be used across domains.

Allowed origins include:
- `http://localhost:5173`
- `http://localhost:5174`
- `https://streamoraa.onrender.com`
- plus `process.env.CORS_ORIGIN` (if provided)

## Security Notes

- **Helmet** sets safer HTTP headers.
- **Rate limiting** is applied under `/api/`.
- **JWT auth** supports both cookies and `Authorization` header.
- Global error handler includes clean handling for Multer upload errors (size, unexpected file, invalid formats).

## Frontend Architecture Notes

- API calls are organized in **service modules** (Axios).
- Auth state is managed in **Zustand**.
- Feeds use **Intersection Observer** for smoother infinite scrolling.
- SPA refresh is handled via a `_redirects` file to avoid route 404s in static hosting.

