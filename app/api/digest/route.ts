import { getCached, setCached } from "@/lib/cache";
import { getDigest } from "@/lib/digest";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

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
