# 📖 Reader's Haven

A modern, high-fidelity, and premium manga reader website powered by the [MangaDex API](https://api.mangadex.org). Designed with state-of-the-art aesthetics, responsiveness, and seamless navigation.

> [!NOTE]
> This platform implements dynamic layouts, glassmorphism, responsive grid structures, and full theme support to deliver a truly immersive reading experience.

---

## ✨ Features & Premium UX Design

### 🌟 High-Fidelity UI/UX
- **Dynamic Hero Carousel**: Responsive hero slider utilizing a full-bleed blurred backdrop cover art, gradient overlay, and glassmorphic card on mobile devices. Supports direct title & cover click interaction with premium hover transitions.
- **Glassmorphism Design**: Sleek dark/light-aware glassmorphic components with dynamic back-filter blurs.
- **Unified Theme Control**: Seamlessly transitions between premium dark mode and slate-contrast light mode across all pages, forms, and layout structures.
- **Swipeable Mobile Lists**: "Recently Read History" and "New This Week" sections dynamically adapt to a horizontal swipe/scroll layout on mobile viewports for clean, vertical-space-saving browsing.
- **Mobile-Responsive Detail Pages**: Automatically centers cover art cards and renders full-bleed, tap-friendly stacked CTA buttons ("Start Reading" and "Bookmark") for optimal thumb reachability.

### 🛠️ Robust Content Engine
- **Multi-Language Title Resolution**: A localized title extraction fallback system that automatically resolves non-English titles (Japanese, Korean, etc.) when standard English translations are unavailable.
- **Reading History Integration**: Tracks reading progress and dynamically loads full cover assets to display in the beautiful **History Drawer** in the Header.
- **Rate-Limited API Proxies**: Safe API requests with custom rate-limiting (4 req/s) and intelligent query hooks preventing empty or invalid calls.

---

## 📂 Project Structure

```
readers-haven/
├── frontend/                 # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI, layout, and MangaCard components
│   │   ├── pages/            # Page routes (Home, Search, MangaDetail, Reader, Login, Signup)
│   │   ├── hooks/            # React Query hooks for MangaDex API
│   │   ├── services/         # API service layer
│   │   ├── store/            # Zustand state management (auth, settings, user data)
│   │   └── lib/              # Utilities (API client, rate limiter, types)
│   └── dist/                 # Production built output
├── workers/
│   ├── api/                  # Cloudflare Worker — BFF proxy to MangaDex API (enforces rate-limits)
│   └── images/               # Cloudflare Worker — Image proxy (bypasses hotlink protection)
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### 📋 Prerequisites
- **Node.js**: `v20+`
- **Wrangler CLI**: For Cloudflare Workers development and deployment.

### 1. Frontend Development

```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

### 2. Cloudflare Workers (Development)

Run these in separate terminals:

```bash
# API Proxy (BFF)
cd workers/api
npx wrangler dev --port 8787

# Image Proxy
cd workers/images
npx wrangler dev --port 8788
```

> [!TIP]
> In development mode, the Vite configuration automatically proxies `/api` ➔ `:8787` and `/images` ➔ `:8788`.

### 3. Production Build

```bash
cd frontend
npm run build     # Compiles and outputs production bundle to frontend/dist/
```

---

## 🏗️ Architecture

### 🛡️ API Proxy Worker (`workers/api`)
- Proxies all requests to `api.mangadex.org`.
- Enforces rate limiting (**4 req/s per IP**) to remain safely under MangaDex's 5 req/s limit.
- Injects standard CORS headers.
- Caches common API responses at the edge.

### 🖼️ Image Proxy Worker (`workers/images`)
- Proxies image requests from `uploads.mangadex.org`.
- Bypasses hotlink protections set by upstream servers.
- Caches cover images at the edge for **24 hours** using the Cloudflare Cache API.

---

## 🗄️ Database

User-specific data (reading history, follows, collections) is securely stored in a Cloudflare D1 SQL database.
The schema is defined in [workers/api/migrations/0001_initial.sql](file:///c:/Users/apria/Downloads/Compressed/Reader's-Haven/Reader's-Haven/workers/api/migrations/0001_initial.sql).

Execute the migration locally using Wrangler:
```bash
npx wrangler d1 execute readers-haven --file=migrations/0001_initial.sql
```

---

## 🚀 Deployment

### Cloudflare Pages (Frontend)
```bash
cd frontend
npm run build
npx wrangler pages deploy dist/
```

### Cloudflare Workers
```bash
cd workers/api
npx wrangler deploy

cd workers/images
npx wrangler deploy
```

---

## ⚠️ Important MangaDex API Rules
1. **No Ads**: Ad-free platform environment (enforced by MangaDex Acceptable Use Policy).
2. **Credits**: Always credit scanlation groups and MangaDex.
3. **CORS & Hotlinking**: Requests and images *must* be proxied.
4. **Exponential Backoff**: Handle HTTP `429` responses with intelligent exponential backoff.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
