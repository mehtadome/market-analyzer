import { describe, it, expect, beforeEach } from "vitest";
import { getCached, setCached } from "../cache";
import type { DigestRecord } from "../digest";

function makeRecord(date: string): DigestRecord {
  return { date, timestamp: "", mood: "normal", prose: "", components: [], rawText: "", usage: { inputTokens: 0, outputTokens: 0, costUsd: 0 } };
}

describe("cache", () => {
  beforeEach(() => {
    // Reset module state between tests by evicting anything stored
    setCached("__reset__", makeRecord("__reset__"));
  });

  it("returns null for a cache miss", () => {
    expect(getCached("2099-01-01")).toBeNull();
  });

  it("returns a record after it is set", () => {
    const rec = makeRecord("2026-04-19");
    setCached("2026-04-19", rec);
    expect(getCached("2026-04-19")).toEqual(rec);
  });

  it("evicts stale dates on write", () => {
    setCached("2026-04-18", makeRecord("2026-04-18"));
    setCached("2026-04-19", makeRecord("2026-04-19"));
    expect(getCached("2026-04-18")).toBeNull();
    expect(getCached("2026-04-19")).not.toBeNull();
  });

  it("overwrites an existing entry for the same date", () => {
    const v1 = makeRecord("2026-04-19");
    const v2 = { ...makeRecord("2026-04-19"), mood: "danger" };
    setCached("2026-04-19", v1);
    setCached("2026-04-19", v2);
    expect(getCached("2026-04-19")?.mood).toBe("danger");
  });
});
