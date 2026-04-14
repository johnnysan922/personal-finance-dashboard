import { FormEvent, useState } from "react";
import { getApiBase } from "../lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddPosition({ open, onClose, onCreated }: Props) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [averageCost, setAverageCost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          quantity: Number(quantity),
          averageCost: Number(averageCost),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSymbol("");
      setQuantity("");
      setAverageCost("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-position-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 id="add-position-title" className="text-lg font-semibold">
          Add position
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400">
              Symbol
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm outline-none ring-sky-500 focus:ring-2"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="AAPL"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">
              Quantity
            </label>
            <input
              type="number"
              step="any"
              min="0"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">
              Average cost
            </label>
            <input
              type="number"
              step="any"
              min="0"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
              value={averageCost}
              onChange={(e) => setAverageCost(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
