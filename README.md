<div align="center">

# 📖 Reader's Haven

### *The Premium, High-Fidelity Serverless Manga Reader*

A state-of-the-art, ad-free manga reader web application powered by the **MangaDex API**, engineered with serverless edge architecture on **Cloudflare Workers**, **Cloudflare D1 SQL**, and a gorgeous, fully-responsive **React Single Page Application (SPA)**.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFDF00)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[Live Demo](https://readers-haven.pages.dev) · [Report Bug](https://github.com/rianjordan/manga/issues) · [Request Feature](https://github.com/rianjordan/manga/issues)

</div>

---

## 🌟 Premium Features & UI/UX Design

Reader's Haven goes far beyond a simple wrapper. It is built to offer a **cinematic, fluid reading experience** with custom state-of-the-art designs tailored for both desktop and mobile viewports.

### 🎭 Cinematic Front-End Experience
*   **Dynamic Hero Carousel**: Responsive hero slider utilizing full-bleed blurred cover art backgrounds, edge gradient overlays, and dynamic glassmorphism panels. Click any cover or title for immediate navigation with premium hover effects.
*   **Swipeable Mobile Layouts**: Sections like "Recently Read History" and "New This Week" dynamically adapt from grid views (on desktop) to native horizontal swiping carousels on mobile viewports to optimize screen real estate.
*   **Mobile-Optimized Detail Views**: Manga covers are centered (`max-w-[240px]`) and primary action buttons ("Start Reading" and "Add to List") automatically stack into full-width tap targets for perfect thumb-reachability.
*   **Double Theme Control System**: Seamlessly switch between a slate-contrast light mode and a deep immersive dark mode, with smooth CSS transitions across all cards, panels, and form fields.

### ⚙️ Serverless Edge Architecture
*   **Edge Proxies & BFF**: Two separate Cloudflare Workers handle API and image requests.
    *   `workers/api`: Acts as a Backend-For-Frontend (BFF), forwarding requests to the MangaDex API, injecting missing CORS headers, and caching endpoints at the edge.
    *   `workers/images`: Bypasses hotlink protection by proxying image servers and caching raw image chunks for 24 hours to maximize performance.
*   **Edge Database**: Cloudflare D1 (SQL-based serverless database) holds persistent user data including lists, follows, custom bookmarks, and history entries.
*   **Client-Side Rate Limiter**: High-fidelity client-side rate limiting (token bucket / limiter) ensures requests never trigger standard MangaDex API limits.

### 🛠️ Robust Content Engine
*   **Multi-Language Fallbacks**: A localized title extraction engine that searches through multiple key structures, falling back gracefully to Japanese Romaji or first-available localizations if standard English is absent.
*   **Intelligent History Drawer**: Reads your persistent progress state to display recently read chapters inside an animated Sidebar drawer, loaded directly with cover art assets.

---

## 📂 Repository Structure

```
readers-haven/
├── frontend/                 # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/       # Reusable UI widgets & MangaCard components
│   │   ├── pages/            # Page routes (Home, Search, MangaDetail, Reader, Login, Signup)
│   │   ├── hooks/            # TanStack React Query Hooks for server sync
│   │   ├── services/         # MangaDex API service layer
│   │   ├── store/            # Zustand state (Zustand Auth, Settings, Progress)
│   │   └── lib/              # Client RateLimiter, API fetch custom client
│   └── dist/                 # Production compiled frontend bundle
├── workers/
│   ├── api/                  # BFF API Proxy Cloudflare Worker (D1 SQL Integration)
│   └── images/               # Cover Art Image Proxy Cloudflare Worker
├── .env.example              # Template for environment settings
└── README.md                 # Project Documentation
```

---

## ⚡ Quick Start & Installation

### 📋 Prerequisites
*   **Node.js**: `v20.x` or higher
*   **Package Manager**: `npm` (comes with Node)
*   **Wrangler CLI**: Global installation (`npm i -g wrangler`) for Cloudflare Workers interaction.

### 1. Local Repository Setup
```bash
git clone https://github.com/rianjordan/manga.git
cd manga
```

### 2. Frontend Installation & Dev
```bash
cd frontend
npm install
npm run dev
```
> The frontend dev server starts on [http://localhost:5173](http://localhost:5173).

### 3. Serverless Edge Workers Dev
In separate terminals, spin up the local worker instances:
```bash
# Terminal A: Start the API BFF Proxy
cd workers/api
npx wrangler dev --port 8787

# Terminal B: Start the Cover Art Image Proxy
cd workers/images
npx wrangler dev --port 8788
```
> [!TIP]
> The Vite dev config is pre-configured to automatically forward `/api` requests to `:8787` and `/images` to `:8788` to match local worker instances.

---

## 🗄️ Database Setup (Cloudflare D1 SQL)

Persistent structures (reading history, manga bookmark tracking, follow statuses) are held in Cloudflare D1.

1.  **Run Migrations Locally**:
    ```bash
    cd workers/api
    npx wrangler d1 execute readers-haven --local --file=migrations/0001_initial.sql
    ```
2.  **Create Production DB and Run Migrations**:
    ```bash
    # Create the database
    npx wrangler d1 create readers-haven
    
    # Run the SQL migration against production
    npx wrangler d1 execute readers-haven --remote --file=migrations/0001_initial.sql
    ```

---

## 🚀 Building & Production Deployment

### Frontend Compilation
```bash
cd frontend
npm run build     # Outputs optimized bundle to /frontend/dist/
```

### Deploy to Cloudflare Pages & Workers
```bash
# 1. Deploy Frontend Bundle
cd frontend
npx wrangler pages deploy dist/

# 2. Deploy Serverless BFF Worker
cd workers/api
npx wrangler deploy

# 3. Deploy Serverless Image Cache Worker
cd workers/images
npx wrangler deploy
```

---

## 🛡️ Important API Best Practices (MangaDex AUP)

As a premium application utilizing MangaDex API as its content source, Reader's Haven strictly complies with all official guidelines:
1.  **Ad-Free Experience**: The portal features zero ads to comply with MangaDex AUP.
2.  **CORS Proxy**: All MangaDex calls are forwarded through `workers/api` to solve CORS-origin restrictions.
3.  **Image Routing**: Images are routed through `workers/images` to prevent hotlinking bans and provide edge caching.
4.  **Client-Side Limiting**: Utilizes a rate bucket limiting requests to **4 req/s** to ensure stability.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
Designed with ❤️ by Rian Jordan. Built for Manga Lovers.
</div>
