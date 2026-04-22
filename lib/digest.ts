import fs from "fs/promises";
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

// Creates the digests directory if it doesn't exist yet
async function ensureDir() {
  await fs.mkdir(DIGESTS_DIR, { recursive: true });
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

// Unions ticker symbols from the existing digest with the incoming one — newer context/direction wins per symbol.
// Prevents multiple same-day briefings from overwriting earlier ticker signals.
function mergeTickerMentions(existing: ComponentSpec[], incoming: ComponentSpec[]): ComponentSpec[] {
  const existingTickers = (existing.find((c) => c.type === "TickerMentionList")?.data.tickers ?? []) as TickerSpec[];
  const incomingTickers = (incoming.find((c) => c.type === "TickerMentionList")?.data.tickers ?? []) as TickerSpec[];

  const merged = new Map<string, TickerSpec>(existingTickers.map((t) => [t.symbol, t]));
  for (const t of incomingTickers) merged.set(t.symbol, t);

  return incoming.map((c) =>
    c.type === "TickerMentionList"
      ? { ...c, data: { ...c.data, tickers: Array.from(merged.values()) } }
      : c
  );
}

// Writes today's digest to disk. If a digest already exists for today, merges ticker mentions rather than overwriting.
export async function saveDigest(record: Omit<DigestRecord, "date" | "timestamp">): Promise<DigestRecord> {
  await ensureDir();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const timestamp = now.toISOString();
  const filepath = path.join(DIGESTS_DIR, `${date}.json`);

  const existing = await getDigest(date);
  const components = existing
    ? mergeTickerMentions(existing.components as ComponentSpec[], record.components as ComponentSpec[])
    : record.components;

  const full: DigestRecord = { date, timestamp, ...record, components };
  await fs.writeFile(filepath, JSON.stringify(full, null, 2));
  return full;
}

// Reads a digest by date (YYYY-MM-DD). Returns null if no file exists for that date.
export async function getDigest(date: string): Promise<DigestRecord | null> {
  const filepath = path.join(DIGESTS_DIR, `${date}.json`);
  try {
    return JSON.parse(await fs.readFile(filepath, "utf-8"));
  } catch {
    return null;
  }
}

// Returns all digest dates as YYYY-MM-DD strings, sorted newest-first.
export async function listDigests(): Promise<string[]> {
  await ensureDir();
  const files = await fs.readdir(DIGESTS_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}
