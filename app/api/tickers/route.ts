import { listDigests, getDigest } from "@/lib/digest";

export interface TickerSummary {
  symbol: string;
  direction: "up" | "down" | "neutral";
  lastSeen: string; // YYYY-MM-DD
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
  // Look back up to 7 days of stored digests
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const dates = listDigests().filter((d) => d >= cutoffStr);

  // symbol → most recent entry wins
  const map = new Map<string, TickerSummary>();

  for (const date of dates) {
    const digest = getDigest(date);
    if (!digest) continue;

    for (const comp of digest.components as ComponentSpec[]) {
      if (comp.type !== "TickerMentionList") continue;
      for (const t of comp.data.tickers ?? []) {
        if (!map.has(t.symbol)) {
          map.set(t.symbol, {
            symbol: t.symbol,
            direction: t.direction ?? "neutral",
            lastSeen: date,
          });
        }
      }
    }
  }

  // listDigests() returns newest-first, so first-write-wins = most recent
  const tickers = Array.from(map.values());
  return Response.json(tickers);
}
