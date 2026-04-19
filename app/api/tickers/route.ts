import { listDigests, getDigest } from "@/lib/digest";

export interface TickerSummary {
  symbol: string;
  direction: "up" | "down" | "neutral";
  lastSeen: string; // YYYY-MM-DD
  mentions: number; // total across last 7 days
}

interface TickerSpec {
  symbol: string;
  direction?: "up" | "down" | "neutral";
}

interface ComponentSpec {
  type: string;
  data: { tickers?: TickerSpec[] };
}

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const dates = listDigests().filter((d) => d >= cutoffStr);

  // symbol → aggregated data (direction = most recent since dates is newest-first)
  const map = new Map<string, TickerSummary>();

  for (const date of dates) {
    const digest = getDigest(date);
    if (!digest) continue;

    for (const comp of digest.components as ComponentSpec[]) {
      if (comp.type !== "TickerMentionList") continue;
      for (const t of comp.data.tickers ?? []) {
        const existing = map.get(t.symbol);
        if (existing) {
          existing.mentions += 1;
        } else {
          map.set(t.symbol, {
            symbol: t.symbol,
            direction: t.direction ?? "neutral",
            lastSeen: date,
            mentions: 1,
          });
        }
      }
    }
  }

  const tickers = Array.from(map.values()).sort((a, b) => b.mentions - a.mentions);
  return Response.json(tickers);
}
