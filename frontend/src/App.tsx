import { useCallback, useEffect, useMemo, useState } from "react";
import { AddPosition } from "./components/AddPosition";
import { PnLSummary } from "./components/PnLSummary";
import { Portfolio } from "./components/Portfolio";
import { PriceChart } from "./components/PriceChart";
import { Watchlist } from "./components/Watchlist";
import { usePrices } from "./hooks/usePrices";
import { useWebSocket } from "./hooks/useWebSocket";
import { getApiBase } from "./lib/api";
import { usePortfolioStore } from "./store/portfolioStore";
import type { HistoryPoint, PriceSnapshot } from "./types";

const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "GOOG"];

export default function App() {
  const {
    positions,
    loading,
    error,
    fetchPositions,
    updatePosition,
    deletePosition,
  } = usePortfolioStore();
  const { bySymbol, applyTick } = usePrices();
  const [chartSymbol, setChartSymbol] = useState(DEFAULT_WATCHLIST[0]!);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previousCloseBySymbol, setPreviousCloseBySymbol] = useState<
    Record<string, number>
  >({});
  const [addOpen, setAddOpen] = useState(false);

  const onWsMessage = useCallback(
    (data: unknown) => applyTick(data),
    [applyTick],
  );
  useWebSocket({ onMessage: onWsMessage });

  useEffect(() => {
    void fetchPositions();
  }, [fetchPositions]);

  useEffect(() => {
    const ac = new AbortController();
    setHistoryLoading(true);
    const url = `${getApiBase()}/api/history/${encodeURIComponent(chartSymbol)}?period=1d`;
    fetch(url, { signal: ac.signal })
      .then((r) => r.json())
      .then((data: HistoryPoint[]) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((e: unknown) => {
        const aborted =
          e instanceof DOMException && e.name === "AbortError";
        if (!aborted) setHistory([]);
      })
      .finally(() => {
        if (!ac.signal.aborted) setHistoryLoading(false);
      });
    return () => ac.abort();
  }, [chartSymbol]);

  const watchSymbols = useMemo(() => {
    const fromPortfolio = positions.map((p) => p.symbol);
    const set = new Set([...DEFAULT_WATCHLIST, ...fromPortfolio]);
    return Array.from(set);
  }, [positions]);

  useEffect(() => {
    if (watchSymbols.length === 0) {
      setPreviousCloseBySymbol({});
      return;
    }
    const ac = new AbortController();
    const qs = watchSymbols.map(encodeURIComponent).join(",");
    fetch(`${getApiBase()}/api/prices/snapshot?symbols=${qs}`, {
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((rows: PriceSnapshot[]) => {
        if (!Array.isArray(rows)) return;
        const next: Record<string, number> = {};
        for (const row of rows) {
          if (
            row &&
            typeof row.symbol === "string" &&
            typeof row.previousClose === "number"
          ) {
            next[row.symbol] = row.previousClose;
          }
        }
        setPreviousCloseBySymbol(next);
      })
      .catch((e: unknown) => {
        const aborted = e instanceof DOMException && e.name === "AbortError";
        if (!aborted) setPreviousCloseBySymbol({});
      });
    return () => ac.abort();
  }, [watchSymbols]);

  const { totalCost, totalMarketValue, dayPnl } = useMemo(() => {
    let cost = 0;
    let mkt = 0;
    let day = 0;
    let hasDay = false;
    for (const p of positions) {
      const c = p.quantity * p.averageCost;
      cost += c;
      const last = bySymbol[p.symbol]?.price;
      mkt += last !== undefined ? last * p.quantity : c;
      const previousClose = previousCloseBySymbol[p.symbol];
      if (last !== undefined && previousClose !== undefined) {
        day += p.quantity * (last - previousClose);
        hasDay = true;
      }
    }
    return {
      totalCost: cost,
      totalMarketValue: mkt,
      dayPnl: hasDay ? day : null,
    };
  }, [positions, bySymbol, previousCloseBySymbol]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Market dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Yahoo-backed quotes (v1) · live stream via WebSocket
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="self-start rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Add position
        </button>
      </header>

      <div className="space-y-6">
        <PnLSummary
          totalMarketValue={totalMarketValue}
          totalCost={totalCost}
          dayPnl={dayPnl}
        />
        <Watchlist
          symbols={watchSymbols}
          prices={bySymbol}
          selectedSymbol={chartSymbol}
          onSelectSymbol={setChartSymbol}
        />
        <PriceChart
          key={chartSymbol}
          symbol={chartSymbol}
          data={history}
          loading={historyLoading}
        />
        <Portfolio
          positions={positions}
          prices={bySymbol}
          loading={loading}
          error={error}
          onUpdatePosition={updatePosition}
          onDeletePosition={deletePosition}
        />
      </div>

      <AddPosition
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => void fetchPositions()}
      />
    </div>
  );
}
