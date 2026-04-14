import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint } from "../types";

type Props = {
  symbol: string;
  data: HistoryPoint[];
  loading?: boolean;
};

export function PriceChart({ symbol, data, loading }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    t: new Date(d.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-slate-400">
          {symbol} — price
        </h2>
        {loading ? (
          <span className="text-xs text-slate-500">Loading…</span>
        ) : null}
      </div>
      <div className="mt-3 h-64 w-full">
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-500">No history yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="t" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#38bdf8"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
