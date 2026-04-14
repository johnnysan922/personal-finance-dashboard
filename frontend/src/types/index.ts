export interface PriceTick {
  symbol: string;
  price: number;
  currency?: string;
  timestamp: string;
}

export interface Asset {
  symbol: string;
  name?: string;
  exchange?: string;
}

export interface Position {
  id: number;
  symbol: string;
  quantity: number;
  averageCost: number;
}

export interface HistoryPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
