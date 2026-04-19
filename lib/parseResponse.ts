type Mood = "normal" | "alert" | "opportunity" | "danger";

// Risk-first card order. Lower index = higher priority.
const COMPONENT_PRIORITY: Record<string, number> = {
  RiskFlag: 0,
  MacroSummaryCard: 1,
  BriefingSummary: 2,
  EarningsHighlight: 3,
  TickerMentionList: 4,
  SectorHeatmap: 5,
  NewsletterSummary: 6,
};

function sortByRisk(components: object[]): object[] {
  return [...components].sort((a, b) => {
    const pa = COMPONENT_PRIORITY[(a as { type?: string }).type ?? ""] ?? 99;
    const pb = COMPONENT_PRIORITY[(b as { type?: string }).type ?? ""] ?? 99;
    return pa - pb;
  });
}

function extractJson(content: string): Record<string, unknown> | null {
  const match = content.match(/```json\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function parseMood(content: string): Mood {
  const parsed = extractJson(content);
  const mood = parsed?.mood;
  if (mood === "alert" || mood === "opportunity" || mood === "danger") return mood;
  return "normal";
}

export function parseComponents(content: string): object[] {
  const parsed = extractJson(content);
  const components = Array.isArray(parsed?.components) ? (parsed.components as object[]) : [];
  return sortByRisk(components);
}

export function parseProse(content: string): string {
  const match = content.match(/```json/);
  if (match?.index === undefined) return content.trim();
  return content.slice(0, match.index).trim();
}
