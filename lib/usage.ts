import fs from "fs/promises";
import path from "path";

// Vercel's filesystem is read-only except /tmp
const USAGE_FILE = process.env.USAGE_FILE ?? path.join(process.env.VERCEL ? "/tmp" : process.cwd(), "usage.json");

import { INPUT_COST_PER_TOKEN, OUTPUT_COST_PER_TOKEN } from "@/lib/config";

interface UsageRecord {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  sessionCount: number;
}

// Serializes all writes so concurrent requests can't race on read-modify-write
let writeQueue: Promise<void> = Promise.resolve();

async function read(): Promise<UsageRecord> {
  try {
    const raw = await fs.readFile(USAGE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { totalInputTokens: 0, totalOutputTokens: 0, totalCostUsd: 0, sessionCount: 0 };
  }
}

async function write(record: UsageRecord): Promise<void> {
  await fs.writeFile(USAGE_FILE, JSON.stringify(record, null, 2));
}

export function recordUsage(inputTokens: number, outputTokens: number): void {
  writeQueue = writeQueue.then(async () => {
    const current = await read();
    const cost = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
    await write({
      totalInputTokens: current.totalInputTokens + inputTokens,
      totalOutputTokens: current.totalOutputTokens + outputTokens,
      totalCostUsd: current.totalCostUsd + cost,
      sessionCount: current.sessionCount + 1,
    });
  });
}

export async function getUsage(): Promise<UsageRecord> {
  return read();
}
