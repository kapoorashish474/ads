# Ads Research

Simple, open-source competitive research for ad companies. One app, JSON data — no database required.

## Live demo (GitHub Pages)

**https://kapoorashish474.github.io/ads/**

Static hosting — all research data ships with the site. Reload fetches the published snapshot; it never fabricates new numbers. Suggestion updates persist only for your browser session.

### Enable Pages (one-time)

Pages is enabled with **GitHub Actions** as the source. Each push to `main` runs `.github/workflows/deploy-pages.yml` automatically.

This repository is **public** so GitHub Pages is free. If you fork into a private repo, you need a paid plan or must make it public again.

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
- **Dashboard** — Overview (priority, threats, signals, revenue, strength) · Revenue · Products
- **Market intel** — Signals · Search · Social (LinkedIn + X)
- **Planning** — Suggestions · Benefit (corpus)
- **Source markers** on charts and stats (reported / estimated / modeled / inferred)
- **Authentic data policy** — reload never mutates metrics; modeled indices are labeled explicitly

## Data authenticity

- Metrics come from **public sources** only (filings, company sites, trade press, LinkedIn bands, etc.).
- Every field is tagged **Reported**, **Estimated**, **Modeled**, **Inferred**, or **Mixed** at point of use and in **Sources**.
- **Search interest** is a normalized modeled index — not live Google Trends API data.
- **Strength radar** is a synthesized benchmark from public inputs, not audited financials.
- **Reload snapshot** re-fetches the seed file — it does **not** randomly change numbers.

## Data

Seed lives in `server/data/store.json`. Edit directly or run enrich scripts. Docker volume `app-data` persists changes when self-hosting.

Re-seed executive data:

```bash
node server/scripts/enrich-executive.js
```

Refresh verified hiring (live careers feeds):

```bash
node server/scripts/fetch-verified-hiring.js
```

## Repo

https://github.com/kapoorashish474/ads
