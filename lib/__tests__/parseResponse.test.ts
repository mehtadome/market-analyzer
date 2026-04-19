import { describe, it, expect } from "vitest";
import { parseMood, parseComponents } from "../parseResponse";

const wrap = (obj: object) => "```json\n" + JSON.stringify(obj) + "\n```";

describe("parseMood", () => {
  it("returns normal for missing mood", () => {
    expect(parseMood("no json here")).toBe("normal");
  });

  it("returns normal for unknown mood value", () => {
    expect(parseMood(wrap({ mood: "catastrophic" }))).toBe("normal");
  });

  it.each(["alert", "opportunity", "danger"] as const)("parses %s", (mood) => {
    expect(parseMood(wrap({ mood }))).toBe(mood);
  });
});

describe("parseComponents", () => {
  it("returns empty array when no json block", () => {
    expect(parseComponents("plain text")).toEqual([]);
  });

  it("drops components with unknown type", () => {
    const raw = wrap({ components: [{ type: "UnknownCard", data: {} }] });
    expect(parseComponents(raw)).toHaveLength(0);
  });

  it("parses a valid BriefingSummary", () => {
    const raw = wrap({
      components: [{ type: "BriefingSummary", data: { headline: "Hi", body: "World" } }],
    });
    const result = parseComponents(raw);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("BriefingSummary");
  });

  it("drops a component with an invalid field and keeps valid ones", () => {
    const raw = wrap({
      components: [
        { type: "RiskFlag", data: { headline: "x", detail: "y", severity: "invalid" } },
        { type: "BriefingSummary", data: { headline: "Hi", body: "World" } },
      ],
    });
    const result = parseComponents(raw);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("BriefingSummary");
  });

  it("preserves order of valid components", () => {
    const raw = wrap({
      components: [
        { type: "BriefingSummary", data: { headline: "Hi", body: "World" } },
        { type: "RiskFlag", data: { headline: "x", detail: "y", severity: "high" } },
      ],
    });
    const result = parseComponents(raw);
    expect(result[0].type).toBe("BriefingSummary");
    expect(result[1].type).toBe("RiskFlag");
  });

  it("defaults missing ticker context to empty string", () => {
    const raw = wrap({
      components: [
        { type: "TickerMentionList", data: { tickers: [{ symbol: "AAPL" }] } },
      ],
    });
    const result = parseComponents(raw);
    expect(result).toHaveLength(1);
    if (result[0].type === "TickerMentionList") {
      expect(result[0].data.tickers[0].context).toBe("");
    }
  });
});
