import { create } from "zustand";
import type { Position } from "../types";
import { getApiBase } from "../lib/api";

type PortfolioState = {
  positions: Position[];
  loading: boolean;
  error: string | null;
  fetchPositions: () => Promise<void>;
  updatePosition: (
    id: number,
    patch: Partial<Pick<Position, "symbol" | "quantity" | "averageCost">>,
  ) => Promise<void>;
  deletePosition: (id: number) => Promise<void>;
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  positions: [],
  loading: false,
  error: null,
  async fetchPositions() {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${getApiBase()}/api/portfolio`);
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as Position[];
      set({ positions: data, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load portfolio",
        loading: false,
      });
    }
  },
  async updatePosition(id, patch) {
    set({ error: null });
    try {
      const payload: Record<string, unknown> = {};
      if (patch.symbol !== undefined) payload.symbol = patch.symbol;
      if (patch.quantity !== undefined) payload.quantity = patch.quantity;
      if (patch.averageCost !== undefined) payload.averageCost = patch.averageCost;

      const res = await fetch(`${getApiBase()}/api/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await get().fetchPositions();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to update position",
      });
    }
  },
  async deletePosition(id) {
    set({ error: null });
    try {
      const res = await fetch(`${getApiBase()}/api/portfolio/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await get().fetchPositions();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to delete position",
      });
    }
  },
}));
