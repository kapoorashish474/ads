# Ads Research

Simple, open-source competitive research for ad companies. One app, one container, JSON data — no database required.

## Quick start

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

## Stack

| Layer | Tech |
|-------|------|
| UI | React, Vite, ECharts |
| Server | Fastify (serves API + built UI) |
| Data | `server/data/store.json` (read/write on refresh) |
| Deploy | Single Docker image |

## Features

- Pick a **company** — all tabs compare vs peers
- **Refresh data** — instant update (no queue, no DB)
- Tabs: Overview · Revenue · Products · Signals · **LinkedIn** · **X** · Search · Suggestions · Benefit · **Sources**
- **LinkedIn hiring** — where each company and peers are hiring (public job listings by region, team, and role)
- **X presence** — public Twitter/X profiles, follower scale vs peers, and recent post themes
- **Source markers** on charts and stats (reported / estimated / modeled / inferred)
- **Regional search deep dive** — click a region for trends, metros, and queries

## Data

Seed lives in `server/data/store.json`. Edit directly or refresh in the UI to simulate updates. Docker volume `app-data` persists changes.

## Repo

https://github.com/kapoorashish474/ads
