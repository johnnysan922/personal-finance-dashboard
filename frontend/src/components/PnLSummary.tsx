type Props = {
  totalMarketValue: number;
  totalCost: number;
  dayPnl: number | null;
};

export function PnLSummary({ totalMarketValue, totalCost, dayPnl }: Props) {
  const totalPnl = totalMarketValue - totalCost;
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="text-sm font-medium text-slate-400">Summary</h2>
      <dl className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Market value
          </dt>
          <dd className="text-lg font-semibold tabular-nums">
            ${totalMarketValue.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Total P&amp;L
          </dt>
          <dd
            className={`text-lg font-semibold tabular-nums ${
              totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}
            {totalPnl.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Day P&amp;L
          </dt>
          <dd className="text-lg font-semibold tabular-nums text-slate-300">
            {dayPnl === null ? "—" : `${dayPnl >= 0 ? "+" : ""}${dayPnl.toFixed(2)}`}
          </dd>
        </div>
      </dl>
    </section>
  );
}
