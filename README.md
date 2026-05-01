# personal-finance-dashboard

Live market dashboard (React + FastAPI): watchlist, charts, portfolio, and WebSocket price updates.

## Market data

Start with **Yahoo Finance** on the backend (e.g. `yfinance`), with a path to **Alpaca** or **Polygon** when requirements outgrow it. Full rationale, tradeoffs, and migration triggers: **[ADR 0001 — Yahoo Finance as primary market data (v1)](docs/adr/0001-yahoo-finance-primary-market-data.md)**.

## Layout

```
personal-finance-dashboard/
├── frontend/          # Vite + React + TypeScript + Tailwind + Zustand + Recharts
├── backend/           # FastAPI, SQLAlchemy, yfinance, WebSocket broadcaster
├── infra/             # AWS Amplify / EC2 stubs
└── docs/adr/          # Architecture decision records
```

## Current project state (MVP scaffold)

This repository currently contains a working end-to-end scaffold you can run locally.

### Implemented

- **Live dashboard shell** with `Watchlist`, `PriceChart`, `Portfolio`, `PnLSummary`, and `AddPosition` components.
- **Backend REST endpoints**
  - `GET /health`
  - `GET /api/prices/{symbol}`
  - `GET /api/prices/snapshot?symbols=AAPL,MSFT`
  - `GET /api/history/{symbol}?period=1d`
  - `GET /api/portfolio`
  - `POST /api/portfolio`
  - `PATCH /api/portfolio/{id}`
  - `DELETE /api/portfolio/{id}`
- **WebSocket price updates**
  - `GET ws://127.0.0.1:8000/ws/prices`
  - Backend polls Yahoo on an interval and broadcasts normalized ticks to connected clients.
- **Persistence**
  - SQLAlchemy model for portfolio positions.
  - SQLite by default via `DATABASE_URL=sqlite:///./portfolio.db`.
- **Provider abstraction**
  - Yahoo is wired as v1 provider behind backend provider interfaces (per ADR 0001).

### Current behavior details

- Chart symbol is selected from the watchlist (default starts at `AAPL`); changing selection refetches history.
- Watchlist defaults to `AAPL`, `MSFT`, `GOOG` plus symbols from saved positions.
- Portfolio rows support inline edit and delete actions.
- Total P&L is implemented from position cost basis vs latest streamed price (fallback to cost when price is missing).
- Day P&L is calculated from live last price vs previous close when previous close data is available.

### Not implemented yet (planned next)

- Watchlist management UI.
- Chart symbol selector and richer time ranges.
- Auth/multi-user support.
- Production-grade stream provider migration (Alpaca/Polygon adapter implementation).

## Run locally

**Backend** (Python 3.9+):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # optional overrides
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

What these commands do:

- `cd backend`: move into the backend project folder.
- `python3 -m venv .venv`: create an isolated Python virtual environment.
- `source .venv/bin/activate`: activate the virtual environment (Windows path shown inline).
- `pip install -r requirements.txt`: install backend dependencies into `.venv`.
- `cp .env.example .env`: create a local environment config file you can edit.
- `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`: start the FastAPI dev server with auto-reload on port `8000`.

- REST: `GET http://127.0.0.1:8000/api/prices/AAPL`, `GET .../api/history/AAPL?period=1d`, `GET/POST .../api/portfolio`
- WebSocket: `ws://127.0.0.1:8000/ws/prices`
- Health: `GET http://127.0.0.1:8000/health`

**Frontend** (Node 18+):

```bash
cd frontend
npm install
npm run dev
```

What these commands do:

- `cd frontend`: move into the frontend project folder.
- `npm install`: install frontend dependencies from `package.json`.
- `npm run dev`: start the Vite development server (usually on `http://localhost:5173`).

The Vite dev server proxies `/api` and `/ws` to `127.0.0.1:8000`, so keep the backend running on port 8000. For production builds, set `VITE_API_BASE` and `VITE_WS_BASE` to your API origin if the UI is not served behind the same host as the API.

## Common issues

- `npm: command not found`
  - Install Node.js 18+ (includes npm), then re-open your terminal.
- `address already in use` on port `8000` or `5173`
  - Stop the process using that port or run with a different port.
  - Backend example: `uvicorn app.main:app --reload --port 8001`
  - Frontend example: `npm run dev -- --port 5174`
- `ModuleNotFoundError` or missing Python packages
  - Make sure your virtual env is active: `source .venv/bin/activate`
  - Re-run: `pip install -r requirements.txt`
- CORS or failed API calls from frontend
  - Ensure backend is running and `CORS_ORIGINS` in `backend/.env` includes your frontend origin.
- WebSocket not updating prices
  - Verify backend is running and client connects to `ws://127.0.0.1:8000/ws/prices` (or proxied `/ws/prices` in dev).
  - Check `PRICE_STREAM_SYMBOLS` in `backend/.env` for valid symbols.
- Empty or inconsistent Yahoo responses
  - Retry after a short delay and test another symbol.
  - Yahoo is a v1 source; see ADR 0001 for migration triggers to Alpaca/Polygon.

## Infra

- [`infra/amplify.yml`](infra/amplify.yml) — example Amplify build for `frontend/` (adjust **app root** in the Amplify console if needed for monorepos).
- [`infra/ec2-setup.sh`](infra/ec2-setup.sh) — minimal EC2 bootstrap notes for the Python API.
