# Ads Research

Simple, open-source competitive research for ad companies. One app, JSON data — no database required.

## Live demo (GitHub Pages)

**https://kapoorashish474.github.io/ads/**

Static hosting — all research data ships with the site. Refresh and suggestion updates work in your browser session but reset on reload.

### Enable Pages (one-time)

The deploy workflow (`.github/workflows/deploy-pages.yml`) runs on every push to `main`. To publish:

1. Open [Repository Settings → Pages](https://github.com/kapoorashish474/ads/settings/pages)
2. Set **Source** to **GitHub Actions**
3. Re-run the latest **Deploy GitHub Pages** workflow if needed

**Note:** This repo is currently **private**. Free GitHub Pages works on **public** repositories. For a private repo you need a paid GitHub plan with Pages, or make the repo public under Settings → General → Danger zone.

## Quick start (local Docker)

```bash
docker compose up --build
```

Open **http://localhost:8080**

## Local dev (two terminals)

```bash
# Terminal 1 — API (port 8080)
cd server && npm install && npm run dev

# Terminal 2 — UI with hot reload (port 5173)
cd frontend && npm install && npm run dev
```

UI: http://localhost:5173 · API: http://localhost:8080

### Preview GitHub Pages build locally

```bash
node scripts/prepare-pages-build.js
cd frontend && VITE_USE_STATIC_DATA=true VITE_BASE_PATH=/ads/ npm run build
npm run preview -- --base /ads/
```

## Stack

| Layer | Tech |
|-------|------|
| UI | React, Vite, ECharts |
| Server | Fastify (local Docker only) |
| Data | `server/data/store.json` |
| Deploy | GitHub Pages (static) or Docker (full API) |

## Features

- Pick a **company** — all views compare vs peers
- **Executive Brief** — decision, signals, threats, gaps, leadership
- **Market intel** — Signals · Search · Social (LinkedIn + X)
- **Dashboard** — Overview · Revenue · Products
- **Planning** — Suggestions · Benefit (corpus)
- **Source markers** on charts and stats (reported / estimated / modeled / inferred)

## Data

Seed lives in `server/data/store.json`. Edit directly or run enrich scripts. Docker volume `app-data` persists changes when self-hosting.

Re-seed executive data:

```bash
node server/scripts/enrich-executive.js
```

## Repo

https://github.com/kapoorashish474/ads
