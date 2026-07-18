# Kargo Intel

Public-source competitive intelligence for **Kargo**. Answers: *What should Kargo build next to stay ahead?*

**Data policy:** public sources only. No confidential, internal, or customer data. Every claim is source-marked with a confidence score.

## Stack

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** Express API (`backend/`)

## Run with Docker

```bash
docker compose up --build -d
```

- App: http://localhost:5173
- API: http://localhost:5000

## Surfaces

| Page | Purpose |
|------|---------|
| **Radar** | Top moves, capability radar, scope to improve, quarter pulse |
| **Quarters** | Public peer moves by quarter |
| **Scope** | Scope-to-improve map + radar vs peer best |
| **Playbooks** | Inspired-by → lesson → quick win |
| **Moves** | Ranked opportunities with evidence |
| **Peers** | Peer map + opportunity ranking |
| **Signals** | Public ingest feed |
| **Sources** | Marked public origins |

## API

| Path | Description |
|------|-------------|
| `GET /api/dashboard` | Radar payload |
| `GET /api/quarters` | Quarterly public moves |
| `GET /api/scope-map` | Scope to improve + radar inputs |
| `GET /api/learnings` | Peer playbooks |
| `GET /api/evidence?ids=` | Evidence bundle |
| `GET /api/opportunities` | Recommended moves |
| `GET /api/signals` | Signal feed |
| `GET /api/sources` | Source catalog |
| `GET /api/competitors` | Peer map |

## Git

Remote: https://github.com/Kapoorashish474/ads  
Author identity for publishes: `kapoorashish474` / `kapoorashish474@gmail.com`
