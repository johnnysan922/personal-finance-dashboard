import type { Position } from "../types";
import type { PriceTick } from "../types";

type Props = {
  positions: Position[];
  prices: Record<string, PriceTick>;
  loading?: boolean;
  error?: string | null;
};

export function Portfolio({ positions, prices, loading, error }: Props) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="text-sm font-medium text-slate-400">Positions</h2>
      {error ? (
        <p className="mt-2 text-sm text-rose-400">{error}</p>
      ) : null}
      {loading ? (
        <p className="mt-2 text-sm text-slate-500">Loading positions…</p>
      ) : null}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <th className="pb-2 pr-4">Symbol</th>
              <th className="pb-2 pr-4">Qty</th>
              <th className="pb-2 pr-4">Avg cost</th>
              <th className="pb-2 pr-4">Last</th>
              <th className="pb-2">Market value</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const last = prices[p.symbol]?.price;
              const mv =
                last !== undefined ? last * p.quantity : p.quantity * p.averageCost;
              return (
                <tr
                  key={p.id}
                  className="border-b border-slate-800/80 last:border-0"
                >
                  <td className="py-2 pr-4 font-mono">{p.symbol}</td>
                  <td className="py-2 pr-4 tabular-nums">{p.quantity}</td>
                  <td className="py-2 pr-4 tabular-nums">
                    ${p.averageCost.toFixed(2)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {last !== undefined ? `$${last.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-2 tabular-nums">${mv.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && positions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No positions yet.</p>
        ) : null}
      </div>
    </section>
  );
}
