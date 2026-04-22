import fs from "fs";
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

function read(): UsageRecord {
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8"));
  } catch {
    return { totalInputTokens: 0, totalOutputTokens: 0, totalCostUsd: 0, sessionCount: 0 };
  }
}

function write(record: UsageRecord) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(record, null, 2));
}

export function recordUsage(inputTokens: number, outputTokens: number) {
  const current = read();
  const cost = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;

  write({
    totalInputTokens: current.totalInputTokens + inputTokens,
    totalOutputTokens: current.totalOutputTokens + outputTokens,
    totalCostUsd: current.totalCostUsd + cost,
    sessionCount: current.sessionCount + 1,
  });
}

export function getUsage(): UsageRecord {
  return read();
}
