import type { PriceTick } from "../types";

type Props = {
  symbols: string[];
  prices: Record<string, PriceTick>;
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
};

export function Watchlist({
  symbols,
  prices,
  selectedSymbol,
  onSelectSymbol,
}: Props) {
  const interactive =
    typeof onSelectSymbol === "function" && selectedSymbol !== undefined;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-slate-400">Watchlist</h2>
        {interactive ? (
          <p className="text-xs text-slate-500">
            Click a ticker to chart it
          </p>
        ) : null}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {symbols.map((sym) => {
          const tick = prices[sym];
          const selected = interactive && sym === selectedSymbol;

          const itemClass =
            "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors " +
            (selected
              ? "border-sky-500/80 bg-sky-950/50 ring-1 ring-sky-500/40"
              : "border-slate-800 bg-slate-950/60 hover:border-slate-600");

          if (interactive) {
            return (
              <li key={sym}>
                <button
                  type="button"
                  className={itemClass}
                  aria-pressed={selected}
                  onClick={() => onSelectSymbol!(sym)}
                >
                  <span className="font-mono text-sm font-medium">{sym}</span>
                  <span className="tabular-nums text-slate-200">
                    {tick ? `$${tick.price.toFixed(2)}` : "—"}
                  </span>
                </button>
              </li>
            );
          }

          return (
            <li
              key={sym}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
            >
              <span className="font-mono text-sm font-medium">{sym}</span>
              <span className="tabular-nums text-slate-200">
                {tick ? `$${tick.price.toFixed(2)}` : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
