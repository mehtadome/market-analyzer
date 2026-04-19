"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DigestTickerBadge } from "@/components/ui/DigestTickerBadge";
import type { TickerSummary } from "@/app/api/tickers/route";

interface Props {
  tickers: TickerSummary[];
}

const BAR_FILL = "var(--chart-1)";
/** Matches `<Bar maxBarSize={…} />` so label boxes align with bar thickness. */
const BAR_THICKNESS = 24;
const TICK_W = 56; // width of the foreignObject that renders each ticker tag
const TICK_H = BAR_THICKNESS;

function YAxisTick({
  x, y, payload, directionMap,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x?: any; y?: any;
  payload?: { value: string };
  directionMap: Map<string, "up" | "down" | "neutral">;
}) {
  if (!payload) return null;
  return (
    <foreignObject
      x={(x ?? 0) - TICK_W - 4}
      y={(y ?? 0) - TICK_H / 2}
      width={TICK_W}
      height={TICK_H}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <DigestTickerBadge
        symbol={payload.value}
        direction={directionMap.get(payload.value) ?? "neutral"}
        compact
      />
    </foreignObject>
  );
}

export function TickerMentionChart({ tickers }: Props) {
  if (tickers.length === 0) {
    return (
      <div className="card" style={{ padding: "1.5rem" }}>
        <p className="ds-prose" style={{ color: "var(--text-muted)" }}>
          No ticker data yet — run today&apos;s briefing first.
        </p>
      </div>
    );
  }

  // Cap at top 12 for readability
  const data = tickers.slice(0, 12);
  const directionMap = new Map(data.map((t) => [t.symbol, t.direction]));

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <div className="ds-label">Bi-weekly mention frequency</div>
          <div className="ds-title" style={{ marginTop: "0.15rem" }}>
            Watchlist activity
          </div>
        </div>
      </div>
      <div className="card__body" style={{ paddingBottom: "1.25rem" }}>
        <ResponsiveContainer width="100%" height={data.length * 40 + 40}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 24, left: 8, bottom: 24 }}
          >
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              width={TICK_W + 4}
              tick={(props) => <YAxisTick {...props} directionMap={directionMap} />}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--btn-bg)" }}
              contentStyle={{
                background: "var(--background)",
                border: "1px solid var(--dc-border)",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                color: "var(--text)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                `${value as number} mention${(value as number) !== 1 ? "s" : ""}`,
                "7-day total",
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => String(label)}
            />
            <Bar
              dataKey="mentions"
              fill={BAR_FILL}
              radius={[0, 4, 4, 0]}
              maxBarSize={BAR_THICKNESS}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
