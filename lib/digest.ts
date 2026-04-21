import fs from "fs";
import path from "path";

// Vercel's filesystem is read-only except /tmp
const DIGESTS_DIR = process.env.DIGESTS_DIR ?? path.join(process.env.VERCEL ? "/tmp" : process.cwd(), "digests");

export interface DigestRecord {
  date: string;         // YYYY-MM-DD
  timestamp: string;    // ISO
  mood: string;
  prose: string;
  components: object[];
  rawText: string;      // full assistant message text, used to render DigestRenderer from cache
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
}

function ensureDir() {
  if (!fs.existsSync(DIGESTS_DIR)) fs.mkdirSync(DIGESTS_DIR);
}

interface TickerSpec {
  symbol: string;
  context?: string;
  direction?: "up" | "down" | "neutral";
}

interface ComponentSpec {
  type: string;
  data: Record<string, unknown>;
}

function mergeTickerMentions(existing: ComponentSpec[], incoming: ComponentSpec[]): ComponentSpec[] {
  const existingTickers = (existing.find((c) => c.type === "TickerMentionList")?.data.tickers ?? []) as TickerSpec[];
  const incomingTickers = (incoming.find((c) => c.type === "TickerMentionList")?.data.tickers ?? []) as TickerSpec[];

  // Build map from existing, then overwrite with incoming (newer context wins)
  const merged = new Map<string, TickerSpec>(existingTickers.map((t) => [t.symbol, t]));
  for (const t of incomingTickers) merged.set(t.symbol, t);

  // Replace TickerMentionList in incoming components with merged result
  return incoming.map((c) =>
    c.type === "TickerMentionList"
      ? { ...c, data: { ...c.data, tickers: Array.from(merged.values()) } }
      : c
  );
}

export function saveDigest(record: Omit<DigestRecord, "date" | "timestamp">): DigestRecord {
  ensureDir();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const timestamp = now.toISOString();
  const filepath = path.join(DIGESTS_DIR, `${date}.json`);

  const existing = getDigest(date);
  const components = existing
    ? mergeTickerMentions(existing.components as ComponentSpec[], record.components as ComponentSpec[])
    : record.components;

  const full: DigestRecord = { date, timestamp, ...record, components };
  fs.writeFileSync(filepath, JSON.stringify(full, null, 2));
  return full;
}

export function getDigest(date: string): DigestRecord | null {
  const filepath = path.join(DIGESTS_DIR, `${date}.json`);
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch {
    return null;
  }
}

export function listDigests(): string[] {
  ensureDir();
  return fs
    .readdirSync(DIGESTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}
