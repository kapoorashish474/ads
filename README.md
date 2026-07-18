# Intel

Public-source competitive intelligence dashboard. Answers: *What should we build next to stay ahead?*

**Data policy:** public sources only. No confidential, internal, or customer data. Every claim is source-marked with a confidence score.

## Stack

- **Frontend:** React + Vite (`Frontend/`)
- **Backend:** Express API (`Backend/`)

## Run with Docker

```bash
docker compose up --build -d
```

- App: http://localhost:5173
- API: http://localhost:5001/api/health

## GitHub Pages

Live: https://kapoorashish474.github.io/ads/

Pushes to `main` build static data and deploy via GitHub Actions.

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

## Git

Remote: https://github.com/kapoorashish474/ads
