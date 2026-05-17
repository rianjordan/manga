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

## ✨ Detailed Features & Technical Walkthrough

### 🏠 1. Homepage & Discover Center
*   **Dynamic Interactive Carousel**:
    *   *Implementation*: A full-featured slideshow that queries featured manga cards directly from the MangaDex API. Uses Framer-motion inspired timing arrays to slide transition titles.
    *   *Mobile Glassmorphism*: Under `768px`, the UI triggers a custom media query rendering:
        - A full-bleed cover art backdrop with a 4px blur and a 35% brightness filter (`blur(4px) brightness(0.35)`).
        - A premium dark-to-transparent overlay gradient.
        - A glassmorphic content box styled with a transparent white border (`border-white/5`), high-blur backdrop filter, and deep box-shadows to ensure high text contrast and legibility.
    *   *Direct Title & Cover Click*: Wraps the main title, cover image, and view details buttons inside `<Link>` elements pointing directly to `/manga/:id`, adding beautiful scaling transitions (`hover:scale-[1.03] duration-500`).
*   **Dynamic Category Hub**:
    *   *Implementation*: Employs responsive tabs allowing readers to switch between **Trending Now**, **Popular Updates**, **New Releases**, and **Recently Completed** sections.
    *   *Query State Loading*: Features React Query cached queries that transition instantly, displaying animated pulse skeleton loaders during data hydration to prevent layout shifts (CLS).
*   **"Recently Read History" Panel**:
    *   *Implementation*: Dynamically lists the user's reading history.
    *   *Mobile Horizontal Scrolling*: Automatically transforms from a traditional vertical-running grid on desktop into a premium, swipe-snapping horizontal list (`flex overflow-x-auto gap-4 pb-3.5 scroll-section`) on viewports under `768px`, dramatically reducing vertical scrolling friction.
    *   *Cover Recovery Handling*: Employs a robust `onError` image handler that automatically replaces missing or broken cover URLs with a high-fidelity local vector placeholder.
*   **"New This Week" Schedule**:
    *   *Implementation*: Displays a weekly release calendar. Uses the custom active CSS class `bg-accent` (theme accent color) to highlight live columns, maintaining a clean visual identity.

### 📚 2. Manga Detail & Metadata Hub
*   **Rich Meta Extraction**:
    *   *Implementation*: Hydrates full details including description, release year, tags/genres, and relationships. It pulls and resolves author and artist names by scanning and filtering MangaDex's relationship array.
*   **Comprehensive Statistics Panel**:
    *   *Implementation*: Directly queries statistical aggregates from `/statistics/manga/:id`.
    *   *Advanced Score Weighting*: Displays Bayesian ratings, overall mathematical mean scores, absolute follow counts, and rolling 6-month averages, presenting a highly informative summary for readers.
*   **Unified Bookmark & Progress Tracker**:
    *   *Implementation*: Integrated with Cloudflare D1 SQL database.
    *   *Custom List Management*: Features a sleek, floating dropdown panel allowing users to instantly select and bookmark their reading state: *Reading, Plan to Read, Completed, On Hold, Dropped, or Re-reading*. Clicking off the dropdown triggers a custom background overlay to close the window gracefully.
*   **Optimized Button Grid**:
    *   *Implementation*: High-fidelity buttons for "Start Reading" and "Add to List" utilize CSS media queries to stack vertically (`flex-col sm:flex-row`) and expand to full width (`w-full sm:w-auto`) on mobile, maximizing thumb-reach target areas.

### 🖼️ 3. Fully-Immersive Manga Reader
*   **Infinite Strip & Page Viewers**:
    *   *Implementation*: Flexible viewport rendering engine allowing seamless switching between paginated reading (left-to-right/right-to-left) and long-strip continuous webtoon scrolling.
*   **Robust Multi-Language Fallback Engine**:
    *   *Implementation*: Resolves missing localized title translations inside the reading header.
    *   *Cascade Extraction*: If standard English titles (`title.en`) are missing from the parsed API relationship mapping, the engine dynamically cascades through alternate language keys (`title.ja`, `title.ko`, etc.) and automatically falls back to `Object.values(title)[0]` to guarantee that actual titles are shown instead of generic placeholders.
*   **Dynamic enabled React Query hooks**:
    *   *Implementation*: Employs a custom `useManga` hook accepting conditional enabling options.
    *   *Circular Call Defence*: Only activates the fetch protocol *after* the chapter relationships have successfully parsed and extracted the unique `mangaId`, completely eliminating redundant or failed API requests during initial page hydration.
*   **Animated History Sidebar Drawer**:
    *   *Implementation*: A slide-out panel accessible from the primary header.
    *   *Edge Hydrated Covers*: The drawer renders detailed cards containing the active chapter number, reading date, and cover file. The reader page saves the exact cover filename during read-progress database synchronization, enabling cover arts to load in both the homepage shelf and the navigation sidebar.

### ⚡ 4. Cloudflare Worker Edge Proxies & Backend (BFF)
*   **BFF Gateway Worker (`workers/api`)**:
    *   *Implementation*: A secure routing node built on Hono/Cloudflare Workers.
    *   *CORS Bypass & Edge Caching*: Appends cross-origin allowance headers, proxies core endpoints, and caches standard catalog listings locally at edge nodes.
    *   *Edge SQL Layer*: Leverages Cloudflare D1 SQL engine, executing lightning-fast CRUD queries to manage user progress, credentials, and bookmark records in under 20ms.
*   **Image Routing Worker (`workers/images`)**:
    *   *Implementation*: Dedicated serverless image proxy.
    *   *Referer Spoofing*: Intercepts image requests and mimics expected MangaDex site referers to bypass hotlinking protection algorithms.
    *   *Persistent Blob Cache*: Leverages standard Cache Storage API to cache full manga chapters at regional edge servers for **24 hours**, saving substantial bandwidth and speeding up subsequent image rendering.

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
