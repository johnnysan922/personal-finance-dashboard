import { FormEvent, useState } from "react";
import type { Position, PriceTick } from "../types";

type Props = {
  positions: Position[];
  prices: Record<string, PriceTick>;
  loading?: boolean;
  error?: string | null;
  onUpdatePosition: (
    id: number,
    patch: Partial<Pick<Position, "symbol" | "quantity" | "averageCost">>,
  ) => Promise<void>;
  onDeletePosition: (id: number) => Promise<void>;
};

type Draft = {
  symbol: string;
  quantity: string;
  averageCost: string;
};

export function Portfolio({
  positions,
  prices,
  loading,
  error,
  onUpdatePosition,
  onDeletePosition,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>({
    symbol: "",
    quantity: "",
    averageCost: "",
  });
  const [busyId, setBusyId] = useState<number | null>(null);

  const beginEdit = (p: Position) => {
    setEditingId(p.id);
    setDraft({
      symbol: p.symbol,
      quantity: String(p.quantity),
      averageCost: String(p.averageCost),
    });
  };

  const saveEdit = async (e: FormEvent, id: number) => {
    e.preventDefault();
    setBusyId(id);
    try {
      await onUpdatePosition(id, {
        symbol: draft.symbol.trim().toUpperCase(),
        quantity: Number(draft.quantity),
        averageCost: Number(draft.averageCost),
      });
      setEditingId(null);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    try {
      await onDeletePosition(id);
      if (editingId === id) setEditingId(null);
    } finally {
      setBusyId(null);
    }
  };

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
              <th className="pb-2 pr-4">Market value</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const last = prices[p.symbol]?.price;
              const mv =
                last !== undefined ? last * p.quantity : p.quantity * p.averageCost;
              const editing = editingId === p.id;
              const busy = busyId === p.id;
              return (
                <tr
                  key={p.id}
                  className="border-b border-slate-800/80 last:border-0"
                >
                  <td className="py-2 pr-4 font-mono">
                    {editing ? (
                      <input
                        value={draft.symbol}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, symbol: e.target.value }))
                        }
                        className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                    ) : (
                      p.symbol
                    )}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {editing ? (
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={draft.quantity}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, quantity: e.target.value }))
                        }
                        className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                    ) : (
                      p.quantity
                    )}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {editing ? (
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={draft.averageCost}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            averageCost: e.target.value,
                          }))
                        }
                        className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                    ) : (
                      `$${p.averageCost.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {last !== undefined ? `$${last.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">${mv.toFixed(2)}</td>
                  <td className="py-2">
                    {editing ? (
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => void saveEdit(e, p.id)}
                      >
                        <button
                          type="submit"
                          disabled={busy}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEditingId(null)}
                          className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => beginEdit(p)}
                          className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void remove(p.id)}
                          className="rounded bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
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
