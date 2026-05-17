# Reader's Haven

A modern manga reader website powered by the [MangaDex API](https://api.mangadex.org).

## Project Structure

```
readers-haven/
├── frontend/                 # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI and layout components
│   │   ├── pages/            # Route pages (Home, Search, MangaDetail, Reader, Login, Signup)
│   │   ├── hooks/            # React Query hooks for MangaDex API
│   │   ├── services/         # API service layer
│   │   ├── store/            # Zustand state (auth, settings, user data)
│   │   └── lib/              # Utilities (API client, rate limiter, types)
│   └── dist/                 # Built output
├── workers/
│   ├── api/                  # Cloudflare Worker — BFF proxy to MangaDex API
│   └── images/               # Cloudflare Worker — Image proxy (anti-hotlinking)
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 20+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (for Workers)

### Frontend

```bash
cd frontend
npm install
npm run dev       # starts Vite dev server on :5173
```

### Workers (development)

In separate terminals:

```bash
# API Proxy (BFF)
cd workers/api
npx wrangler dev --port 8787

# Image Proxy
cd workers/images
npx wrangler dev --port 8788
```

> The Vite config proxies `/api` → `:8787` and `/images` → `:8788` in dev mode.

### Build for Production

```bash
cd frontend
npm run build     # outputs to frontend/dist/
```

## Architecture

### API Proxy Worker (`workers/api`)
- Proxies all requests to `api.mangadex.org`
- Enforces rate limiting (4 req/s per IP — under MD's 5 req/s limit)
- Injects CORS headers (MangaDex does not send CORS)
- Caches responses at the edge

### Image Proxy Worker (`workers/images`)
- Proxies image requests from `uploads.mangadex.org`
- Required because MangaDex blocks hotlinking
- Caches images at the edge for 24h (Cloudflare Cache API)

### Important MangaDex API Rules
1. **No ads** on your platform (per AUP)
2. **Credit MangaDex** and scanlation groups
3. **Proxy all requests** — MangaDex does not send CORS headers
4. **Proxy all images** — MangaDex blocks hotlinking
5. **Send a User-Agent header** identifying your app
6. **Handle 429** responses with exponential backoff

## Database

User-specific data (reading history, follows, collections) is stored in Cloudflare D1.
Schema: `workers/api/migrations/0001_initial.sql`

```bash
npx wrangler d1 execute readers-haven --file=migrations/0001_initial.sql
```

## Deployment

### Frontend → Cloudflare Pages

```bash
cd frontend
npm run build
npx wrangler pages deploy dist/
```

### Workers

```bash
cd workers/api
npx wrangler deploy

cd workers/images
npx wrangler deploy
```

## License

MIT
