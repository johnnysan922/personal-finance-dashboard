import { create } from "zustand";
import type { Position } from "../types";
import { getApiBase } from "../lib/api";

type PortfolioState = {
  positions: Position[];
  loading: boolean;
  error: string | null;
  fetchPositions: () => Promise<void>;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
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
}));
