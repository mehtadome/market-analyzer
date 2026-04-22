"use client";

import { TickerMentionChart } from "@/components/ui/TickerMentionChart";
import type { TickerSummary } from "@/app/api/tickers/route";

export function TickersPanel({ tickers }: { tickers: TickerSummary[] }) {
  return <TickerMentionChart tickers={tickers} />;
}
