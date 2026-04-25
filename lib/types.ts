export interface TickerSpec {
  symbol: string;
  context?: string;
  direction?: "up" | "down" | "neutral";
}

export interface ComponentSpec {
  type: string;
  data: Record<string, unknown>;
}
