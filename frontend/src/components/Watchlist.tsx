import type { PriceTick } from "../types";

type Props = {
  symbols: string[];
  prices: Record<string, PriceTick>;
};

export function Watchlist({ symbols, prices }: Props) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="text-sm font-medium text-slate-400">Watchlist</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {symbols.map((sym) => {
          const tick = prices[sym];
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
