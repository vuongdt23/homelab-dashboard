# Vuong Homelab Dashboard

A themed homelab service launcher with live up/down status and host metrics.
Oceanic Orca (dark) / Blue Whale (light) themes, a status pill per service, a
host metrics strip, and a rotating whale fact on the hero.

## Stack

Monorepo (npm workspaces):

- **`packages/shared`** — TypeScript types shared across server and web
  (`Service`, `ServiceStatus`, `HostMetrics`, `WhaleFact`).
- **`packages/server`** — Hono API + static hosting. Endpoints:
  - `GET /api/services` — the configured service list
  - `GET /api/status` — live up/down per service (parallel probes, per-service timeout)
  - `GET /api/metrics` — host CPU / RAM / disk / uptime
  - `GET /api/config` — the configured host
- **`packages/web`** — Vite + React UI (themes, status pills, metrics strip, whale fact).

## Configure

Two layers, so the committed repo carries no site-specific address:

- **Your homelab address** comes from environment variables. Copy `.env.example`
  to `.env` and set `DASHBOARD_HOST` (the IP/hostname where your services run —
  Tailscale IP, LAN IP, etc.) and optionally `DASHBOARD_PORT` (default `8770`).
  `.env` is gitignored. `docker compose` reads it automatically.
- **The service list** lives in `config/services.json` (id, name, role, port,
  icon, accent). No code changes needed; in Docker the file is bind-mounted, so
  `docker compose restart` picks up edits.

If `DASHBOARD_HOST` is unset the app falls back to `localhost`.

## Develop

Node 24 via nvm. If your shell can't resolve `node`/`npm`, call the versioned
binaries directly:

```bash
NB="$HOME/.nvm/versions/node/v24.11.1/bin"
env PATH="$NB:/usr/bin:/bin" node "$NB/npm" <args>
```

```bash
npm install
npm run dev:server   # http://localhost:8770
npm run dev:web      # http://localhost:5173 (proxies /api to the server)
npm test             # server unit + smoke tests
npm run build        # build all three packages
```

## Deploy (on the homelab host)

```bash
docker compose up -d --build
```

The container uses host networking (binds port 8770, reaches the native systemd
services over `localhost`) and mounts `/proc` + `/storage` read-only for host
metrics. No service credentials are stored or exposed.

## Notes

- Status checks are unauthenticated reachability probes: any HTTP response = Online.
  A network error or timeout = Offline. One slow/dead service never blocks others.
- Host metrics are read from `/proc` and `df`; on a non-Linux dev machine they
  report `—` (no `/proc`), which is expected graceful degradation.
- Whale facts come from <https://vuongdt23.github.io/WaaS/> (fetched by the
  browser; the fact line is hidden when the host has no internet).
- `.planning/`, Stitch exports, and `.superpowers/` are git-ignored; only app
  source and required assets are tracked.
