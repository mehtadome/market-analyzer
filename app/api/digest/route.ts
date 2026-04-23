import { getCached, setCached } from "@/lib/cache";
import { getDigest } from "@/lib/digest";
import { REFRESH_WINDOWS } from "@/lib/config";

// Returns the current hour (0-23) in PT, accounting for PST/PDT automatically.
function ptHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
}

// During these windows newsletters are likely to have updated — bypass cache
// so the next briefing request fetches fresh content.
function isRefreshWindow(): boolean {
  const h = ptHour();
  return REFRESH_WINDOWS.some((w) => h >= w.startHour && h < w.endHour);
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const inWindow = isRefreshWindow();

  // L1: skip during refresh windows so the next briefing pulls fresh from Gmail
  if (!inWindow) {
    const cached = getCached(today);
    if (cached) return Response.json(cached);
  }

  // L2: always serve from disk if available — new tabs see the last briefing even mid-window
  const stored = await getDigest(today);
  if (stored) {
    if (!inWindow) setCached(today, stored);
    return Response.json(stored);
  }

  return Response.json(null);
}
