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

[Live Demo](https://novel-coral-phi.vercel.app/) · [Report Bug](https://github.com/rianjordan/manga/issues) · [Request Feature](https://github.com/rianjordan/manga/issues)

</div>

---

## ✨ Complete Website Features & Technical Architecture Guide

Reader's Haven is packed with high-performance features designed to deliver a modern, premium, and fully integrated reading experience. Here is the exhaustive, detailed breakdown of every feature and system built into the platform:

---

### 🏠 1. Homepage & Discovery Suite (`Home.tsx`)
*   **Spotlight Hero Carousel**:
    *   *Implementation*: A full-bleed responsive carousel rotating through high-profile featured titles. Operates on a structured timer loop that matches current spotlight selections.
    *   *High-Fidelity Mobile Glassmorphism*: When viewed under `768px` (mobile), the layout automatically reorganizes to hide heavy desktop columns and mounts a blurred background cover-art container (`blur(4px) brightness(0.35)`) overlaid with a premium glassmorphic title card (`bg-black/45 backdrop-blur-md border-white/5`), keeping layout heights optimized at `h-[500px]` to save vertical viewport space.
    *   *Direct Core Navigation*: Fully interactive layout where clicking slide cover art, slide titles, or the "View Details" action triggers instant routing (`/manga/:id`) with smooth hover scaling (`hover:scale-[1.03] duration-500`).
*   **Dynamic Category Navigation Hub**:
    *   *Implementation*: Allows readers to seamlessly cycle between **Trending Now**, **Popular Updates**, **New Releases**, and **Recently Completed** sections using a fully responsive, state-controlled tab switcher.
    *   *Hydration & Skeleton Loaders*: Integrated with cached React Query state caches. Shows animated pulse grid skeletons on category switches to eliminate layout shifts (CLS) and maintain fluid transitions.
*   **Horizontal Mobile History Shelf**:
    *   *Implementation*: Displays the reader's active sessions directly on the dashboard.
    *   *Mobile Scroll Adaptation*: Smoothly transforms from a standard vertical-running grid on desktop into a premium, swipe-snapping horizontal list (`flex overflow-x-auto gap-4 pb-3.5 scroll-section`) on small screens, preventing infinite vertical page scrolls.
    *   *Robust Cover Recovery*: Uses standard `onError` image handlers to automatically fallback from broken cover links to local vector placeholders.
*   **Weekly Release Schedule Grid**:
    *   *Implementation*: A structured calendar tracking updates across weekdays. Highlights the active current day card with an accent-colored vertical indicator (`bg-accent`), matching other interface accents.

---

### 📚 2. Manga Detail & Information Center (`MangaDetail.tsx`)
*   **Comprehensive Metadata Aggregation**:
    *   *Implementation*: Queries MangaDex APIs to construct a complete profile containing descriptions, tags, status badges, publication years, and relationships. It scans relationship arrays to dynamically fetch and display author and artist names.
*   **Official Statistics Dashboard**:
    *   *Implementation*: Queries the statistics hub `/statistics/manga/:id` to retrieve real-time global aggregates.
    *   *Data Formatter*: Formats and displays global bookmark/follow numbers, Bayesian ratings (for scientific scale), mean ratings, and rolling 6-month averages to give users comprehensive overview scores.
*   **Unified Bookmark & Reading List dropdown**:
    *   *Implementation*: Connected directly with the Cloudflare D1 SQL worker.
    *   *List State Controller*: A custom dropdown allowing logged-in readers to change list classifications: *Reading, Plan to Read, Completed, On Hold, Dropped, or Re-reading*. Employs a fixed viewport click-catcher overlay to close the dropdown gracefully when clicked outside.
*   **Mobile-Optimized Layout**:
    *   *Implementation*: Centers cover cards (`max-w-[240px]`) on mobile screens to prevent text overlap, and reshapes reading action buttons to stack vertically and span full width (`w-full sm:w-auto`) for comfortable touch target access.
*   **Reverse-Chronological Chapter Feed**:
    *   *Implementation*: Fetches paginated lists of scanlation releases, displaying chapter titles, upload dates, translating groups, and click indicators, highlighting already-read items.

---

### 🖼️ 3. Premium Manga Reader Engine (`Reader.tsx`)
*   **Page-by-Page & Continuous Webtoon scroll layout**:
    *   *Implementation*: Dual rendering engine allowing users to toggle between standard paginated reading (left-to-right or right-to-left) and continuous long-strip vertical webtoon scrolling.
*   **Local Title Fallback Cascade Chain**:
    *   *Implementation*: Resolves localization keys for non-English manga. If English translations (`title.en`) are missing, the cascade searches alternative maps (`title.ja`, `title.ko`, etc.) or grabs the first available key (`Object.values(title)[0]`), ensuring actual manga names are rendered inside the reading navigation header rather than generic placeholders.
*   **Safe Hook Invocations (`useManga`)**:
    *   *Implementation*: Modified the core hook query to support conditional configurations. Fetching queries are paused (`enabled: false`) until chapter parsing resolves the verified `mangaId`, eliminating redundant or broken requests.
*   **Progress Synchronizer (Zustand & Cloudflare D1)**:
    *   *Implementation*: Synchronizes reading page progress (current chapter, active page number, and last read timestamp) automatically to the cloud database on page shifts or tab unloads, ensuring consistent state tracking across all devices.

---

### 🗃️ 4. Bookmark & Custom Lists Dashboard (`MyLists.tsx`)
*   **Tabular Categorized Overviews**:
    *   *Implementation*: Displays categorized tables organizing all bookmarks based on active reading status.
*   **Edge Data Fetching**:
    *   *Implementation*: Queries the Cloudflare D1 SQL layer to load, format, and display custom bookmark cards, offering inline action tools to instantly toggle statuses or remove items.

---

### 🕒 5. My History Sidebar Drawer (`Header.tsx` Drawer Overlay)
*   **Header Quick-Access Sidebar**:
    *   *Implementation*: An animated side-sliding drawer accessible via the navigation header.
*   **Hydrated Session Lists**:
    *   *Implementation*: Queries local and cloud progress layers to load cards containing the active chapter number, cover art image, and read timestamp, allowing users to resume their reading sessions instantly.

---

### 🔍 6. Advanced Catalog Search & Genre Filter (`Search.tsx`)
*   **Multi-Criteria Query Engine**:
    *   *Implementation*: Advanced forms allowing queries to filter by release years, ordering metrics (relevance, rating, uploads), status categories, and specific tag parameters.
*   **Live Search Input**:
    *   *Implementation*: Instant input fields with state caching to prevent query loss on layout shifts.
*   **Infinite Paginated Catalog Grids**:
    *   *Implementation*: Displays matched items in clean, responsive grids. Handles boundary controls dynamically (disabling page shifts at limit boundaries).

---

### 💬 7. Community Forums & Dynamic Discussion Boards (`Forum.tsx`)
*   **Structured Category Hub (`/forum`)**:
    *   *Implementation*: A full-featured forum lobby displaying discussion classifications: *Announcements, General Chat, Manga Recommendations, Help & Support*. 
    *   *Dynamic Thread Querying*: Queries category-specific listings (`GET /forum/threads?categoryId=id`) to resolve thread names, authors, comment totals, and active timings.
*   **Creation & Mod Controls**:
    *   *Implementation*: Registered readers can instantly post new discussions (`POST /forum/threads`). Original creators can delete entire threads (`DELETE /forum/threads/:id`), triggering automatic redirections back to the category index.
*   **Nested Discussion Posts**:
    *   *Implementation*: Renders chronological post threads (`GET /forum/threads/:threadId/posts`). Generates automated robot profile icons using Dicebear seeds (`https://api.dicebear.com/7.x/bottts/svg?seed=username`) for a personalized, high-fidelity chat experience. Support inline deletion triggers (`DELETE /forum/posts/:id`) verified via active server tokens.

---

### 🗣️ 8. Interactive Chapter Comments Sidebar Drawer (`Reader.tsx`)
*   **Sliding Overlay Sidebar Drawer**:
    *   *Implementation*: An animated side-sliding comments sidebar panel that glides in over active reader pages, showcasing the discussion active counts.
*   **Live Edge Comments Feed**:
    *   *Implementation*: Integrates with the Cloudflare D1 SQL backend. Queries chapter-specific discussion records dynamically (`GET /comments?mangaId=id&chapterId=id`) and pushes new comments (`POST /comments`) using raw SQL edge inserts, completely eliminating roundtrip latency.
*   **Inline User Moderation**:
    *   *Implementation*: Authenticated users can instantly delete their own posts directly within the reader sidebar panel.

---

### 🔐 9. User Authentication & Path Guards (`Login.tsx`, `Signup.tsx`)
*   **Sleek Dynamic Forms**:
    *   *Implementation*: Custom credentials forms with real-time feedback, input validations, and floating focus markers.
*   **Zustand Persisted Sessions**:
    *   *Implementation*: Stores auth state and session tokens dynamically inside a global Zustand store synced with local storage, enabling seamless session restoration.
*   **Secure Route Guards**:
    *   *Implementation*: Layout protection wrappers that block unauthenticated users from accessing bookmarks or tracking progress, redirecting them to login with return-path parameters.

---

### 🌗 10. Master Dual-Theme System (`index.css` & Theme Context)
*   **Immersive Deep Dark & Slate Contrast Light Modes**:
    *   *Implementation*: A full CSS variable setup mapping dark backgrounds (`#121212`) and slate light modes (`#f8fafc`).
*   **Global Variable Transitions**:
    *   *Implementation*: Custom CSS variable mappings across all inputs, cards, borders, buttons, scrollbars, and skeletons, enabling seamless mode transitions.

---

### ⚡ 11. Cloudflare Worker Edge Proxies & Backend (BFF)
*   **BFF Gateway Worker (`workers/api`)**:
    *   *Implementation*: A secure routing node built on Hono/Cloudflare Workers.
    *   *CORS Bypass & Edge Caching*: Appends cross-origin allowance headers, proxies core endpoints, and caches standard catalog listings locally at edge nodes.
    *   *Edge SQL Layer*: Agent acts over Cloudflare D1 SQL engine executing quick schema CRUD requests to handle all custom user bookmarks, comments, forums, credentials, and read status progress in <20ms.
*   **Image Routing Proxy (`workers/images`)**:
    *   *Implementation*: Intercepts cover and page requests, overrides referer parameters to mock normal browser queries, and caches cover assets on regional edge caches for **24 hours** using the Cache Storage API, bypassing hotlink blocklists and accelerating page loads.

---

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

### Deploy Frontend to Vercel
You can deploy the React SPA instantly to Vercel by importing the repository or using the CLI:
```bash
cd frontend
npm run build
npx vercel --prod
```

### Deploy Serverless Edge Workers to Cloudflare
```bash
# 1. Deploy Serverless BFF Worker
cd workers/api
npx wrangler deploy

# 2. Deploy Serverless Image Cache Worker
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
