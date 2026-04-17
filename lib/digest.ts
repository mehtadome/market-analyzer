import fs from "fs";
import path from "path";

const DIGESTS_DIR = path.join(process.cwd(), "digests");

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

export function saveDigest(record: Omit<DigestRecord, "date" | "timestamp">): DigestRecord {
  ensureDir();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const timestamp = now.toISOString();
  const filename = `${date}.json`;
  const filepath = path.join(DIGESTS_DIR, filename);

  const full: DigestRecord = { date, timestamp, ...record };
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
