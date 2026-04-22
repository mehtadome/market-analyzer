type Mood = "normal" | "alert" | "opportunity" | "danger";

// Risk-first card order. Lower index = higher priority.
// The model decides which cards appear and what's in them — the app decides where they sit.
// Without this, the model might bury a RiskFlag below a SectorHeatmap on a crisis day.
const COMPONENT_PRIORITY: Record<string, number> = {
  RiskFlag: 0,
  MacroSummaryCard: 1,
  BriefingSummary: 2,
  EarningsHighlight: 3,
  TickerMentionList: 4,
  SectorHeatmap: 5,
  NewsletterSummary: 6,
};

// Sorts components by COMPONENT_PRIORITY so the most urgent cards always render first
function sortByRisk(components: object[]): object[] {
  return [...components].sort((a, b) => {
    const pa = COMPONENT_PRIORITY[(a as { type?: string }).type ?? ""] ?? 99; // unknown types sort to the end
    const pb = COMPONENT_PRIORITY[(b as { type?: string }).type ?? ""] ?? 99;
    return pa - pb;
  });
}

// Pulls the ```json block out of the model's raw text response and parses it
function extractJson(content: string): Record<string, unknown> | null {
  const match = content.match(/```json\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Extracts the mood field from the JSON block; defaults to "normal" if missing or unrecognized
export function parseMood(content: string): Mood {
  const parsed = extractJson(content);
  const mood = parsed?.mood;
  if (mood === "alert" || mood === "opportunity" || mood === "danger") return mood;
  return "normal";
}

// Extracts the components array from the JSON block and sorts it by risk priority
export function parseComponents(content: string): object[] {
  const parsed = extractJson(content);
  const components = Array.isArray(parsed?.components) ? (parsed.components as object[]) : [];
  return sortByRisk(components);
}

// Returns any text the model wrote before the JSON block (usually empty, but preserved just in case)
export function parseProse(content: string): string {
  const match = content.match(/```json/);
  if (match?.index === undefined) return content.trim();
  return content.slice(0, match.index).trim();
}
