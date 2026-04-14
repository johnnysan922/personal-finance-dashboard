# ADR 0001: Yahoo Finance as primary market data (v1)

## Status

Accepted

## Context

The live market dashboard needs **quotes** and **historical candles** for a watchlist and charts. The project is **personal**, should ship quickly, and should avoid vendor cost and signup friction for the first iteration. A later upgrade to a commercial API is likely if requirements tighten (latency, licensing, or reliability).

## Decision

Use **Yahoo Finance** as the initial data source, accessed from the **backend only** via a maintained client library (e.g. **`yfinance`** in Python). Do **not** embed Yahoo scraping or unofficial calls directly in scattered route handlers; expose data through a small **provider abstraction** (e.g. `QuoteProvider` / `HistoryProvider`) so the rest of the app depends on interfaces, not Yahoo.

**Re-evaluate and migrate** to **Alpaca** or **Polygon.io** when the signals below apply. Prefer **configuration** (e.g. `MARKET_DATA_PROVIDER=yahoo` with future values `alpaca` or `polygon`) over hard-coding the provider.

## Consequences

### Positive

- **$0** and **fast to ship**: validate UI, WebSocket flow, portfolio CRUD, and deployment without API billing.
- **Broad symbol coverage** for common US equities and many tickers during prototyping.
- **Contained future change**: swapping providers updates one module plus env/config, not every route.

### Negative / risks

- Yahoo access is via **community libraries**, not a guaranteed official API; upstream changes can break integrations.
- Automated use may conflict with **Yahoo’s terms**; acceptable for **personal** experimentation, **not** a basis for production or redistribution without a proper license.
- **Reliability and latency** are weaker than vendor APIs; not suitable for strict guarantees (e.g. sub-second or compliance-grade streaming).

## Alternatives considered

| Option | Why not now |
|--------|----------------|
| **Alpaca** | Strong fit for official REST/WebSocket and optional trading; adds account signup, limits, and scope before the UI is proven. |
| **Polygon.io** | Strong professional data; free tier is often tight for always-on live dashboards; cost/complexity early. |
| **Yahoo (chosen)** | Best fit for **v1 cost and speed**, with explicit plan to replace if limits bite. |

## Migration triggers

Consider switching to **Alpaca** or **Polygon** (per their current product docs and pricing) when:

| Signal | Notes |
|--------|--------|
| Need **stable streaming** or vendor-grade real-time | Yahoo path is a weak fit for guaranteed low-latency pipelines. |
| Yahoo breaks often enough to slow development | Operational cost exceeds vendor cost. |
| Need **clear licensing** beyond personal use | Prefer a contracted API. |
| Target **consistent sub-500 ms** end-to-end | Measure first; likely needs vendor streaming + tuned deployment. |

**Heuristic:** **Alpaca** if you want one ecosystem for market data and optional paper/live trading. **Polygon** if you want broader institutional-style market data products and budget aligns with usage.

## Follow-up

- Implement backend provider interface and `MARKET_DATA_PROVIDER` (or equivalent) before adding Alpaca/Polygon adapters.
- When this ADR is superseded, add **ADR 0002** and set this document’s status to **Superseded** with a link to the replacement.
