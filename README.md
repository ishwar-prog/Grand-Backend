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


## Video Streaming Architecture (HLS + Adaptive Bitrate)

### Why not plain MP4?

Serving a raw MP4 means the browser downloads the entire file progressively. Seeking re-buffers. Slow connections get the full-quality file whether they can handle it or not. One file, one quality, for everyone - that's the buffering problem.

### What HLS does instead

HLS splits the video into **6-second segments** at multiple quality tiers and generates a `.m3u8` manifest (table of contents). The player downloads only the next 2-3 segments ahead and continuously picks the best quality tier for the current connection speed. This is **ABR - Adaptive Bitrate Streaming**. Seeking is instant because each segment is an independent file.

```
video.m3u8  →  144p.m3u8 / 480p.m3u8 / 1080p.m3u8
                  └── seg_001.ts, seg_002.ts, ...
```

### The pipeline

```
Upload  →  Multer (local temp)  →  Cloudinary (stores MP4, queues HLS)
        →  DB: { videoFile: mp4_url, hlsUrl: "" }
        →  Response to user: "Published" ← fast, ~10–30s

[Background, Cloudinary servers]
        →  Transcodes: 144p / 240p / 360p / 480p / 720p / 1080p
        →  POSTs webhook to your server
        →  DB updated: { hlsUrl: "...manifest.m3u8" }

Playback  →  hlsUrl present? → hls.js handles ABR + quality switcher
          →  hlsUrl empty?   → MP4 fallback (old videos, works as before)
```

### Why async + webhook (not synchronous)

Waiting for HLS to finish inside the upload API call would block for 5-10 minutes. Render kills requests after 30 seconds. So: accept fast, process in background, get notified via webhook when done. Same pattern used by Stripe, Twilio, GitHub Actions - any long-running background job.

### Custom streaming profile

Cloudinary's built-in profiles don't give you full resolution control. We create `streamora_hls` at server startup with exact tiers (144p → 1080p). If it already exists, the 409 error is caught and ignored - safe to call on every restart. Profile lives in code, not the dashboard, so it's reproducible on any environment automatically.

### The player (`hls.js`)

Safari has native HLS support. Every other browser needs `hls.js`. Key points:
- **`MANIFEST_PARSED` event** - `hls.levels` is empty until the manifest downloads. Quality switcher must be built inside this callback, not on component mount.
- **`hls.currentLevel = -1`** = Auto ABR. A positive integer locks to that quality tier.
- **`capLevelToPlayerSize: true`** - never requests 1080p if the player element is 400px wide.
- Quality switches are seamless: current segment finishes, then new quality segments are requested from that point forward.

### Why it scales

Your server never touches video bytes. Cloudinary's CDN delivers segments directly to users from the nearest edge node. 10,000 simultaneous viewers = near-zero video load on your backend. Each segment URL is cached at the CDN edge - the 10,000th request never hits origin storage.

### Backward compatibility

`hlsUrl` is `required: false` in the schema. Old videos have `hlsUrl: ""`. The player falls back to `videoSrc` (MP4). No migration needed.

### Required environment variable

| Variable | Value |
|---|---|
| `CLOUDINARY_WEBHOOK_URL` | `https://your-domain.com/api/v1/videos/webhook/cloudinary` |

### Mental model for next time

1. **Job > 5s → make it async.** Accept → respond immediately → background process → webhook on completion.
2. **Never serve large files from your app server.** Use CDN + object storage (Cloudinary, S3 + CloudFront).
3. **Adaptive streaming = transcode to multiple bitrates + serve segments via CDN + hls.js on client.**
4. **Infrastructure config belongs in code.** Streaming profiles, bucket policies, DB indexes — all should be auto-created at startup, not set up manually in dashboards.

