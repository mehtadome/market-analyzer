type Mood = "normal" | "alert" | "opportunity" | "danger";

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
  return Array.isArray(parsed?.components) ? (parsed.components as object[]) : [];
}

export function parseProse(content: string): string {
  const match = content.match(/```json/);
  if (match?.index === undefined) return content.trim();
  return content.slice(0, match.index).trim();
}
