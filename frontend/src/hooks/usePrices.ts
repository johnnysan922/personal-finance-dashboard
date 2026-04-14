import { useCallback, useState } from "react";
import type { PriceTick } from "../types";

export function usePrices() {
  const [bySymbol, setBySymbol] = useState<Record<string, PriceTick>>({});

  const applyTick = useCallback((raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const o = raw as Record<string, unknown>;
    const symbol = typeof o.symbol === "string" ? o.symbol : null;
    const price = typeof o.price === "number" ? o.price : Number(o.price);
    const timestamp =
      typeof o.timestamp === "string"
        ? o.timestamp
        : new Date().toISOString();
    if (!symbol || Number.isNaN(price)) return;

    const tick: PriceTick = {
      symbol,
      price,
      currency: typeof o.currency === "string" ? o.currency : undefined,
      timestamp,
    };
    setBySymbol((prev) => ({ ...prev, [symbol]: tick }));
  }, []);

  return { bySymbol, applyTick };
}
