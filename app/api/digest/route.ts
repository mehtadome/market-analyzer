import { getCached, setCached } from "@/lib/cache";
import { getDigest } from "@/lib/digest";

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
//   2:00am – 7:00am PT  (pre-market / overnight newsletters)
//   1:00pm – 4:00pm PT  (midday / afternoon editions)
function isRefreshWindow(): boolean {
  const h = ptHour();
  return (h >= 2 && h < 7) || (h >= 13 && h < 16);
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  if (isRefreshWindow()) return Response.json(null);

  // L1: memory
  const cached = getCached(today);
  if (cached) return Response.json(cached);

  // L2: file system
  const stored = getDigest(today);
  if (stored) {
    setCached(today, stored);
    return Response.json(stored);
  }

  return Response.json(null);
}
