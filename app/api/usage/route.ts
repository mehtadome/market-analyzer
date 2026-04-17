import { getUsage } from "@/lib/usage";

export async function GET() {
  return Response.json(getUsage());
}
