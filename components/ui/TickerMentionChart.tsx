"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TickerSummary } from "@/app/api/tickers/route";

interface Props {
  tickers: TickerSummary[];
}

const directionColor: Record<string, string> = {
  up:      "var(--dc-border-pos, #22c55e)",
  down:    "var(--dc-border-high, #ef4444)",
  neutral: "var(--text-muted, #6b7280)",
};

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

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <div className="ds-label">7-day mention frequency</div>
          <div className="ds-title" style={{ marginTop: "0.15rem" }}>
            Watchlist activity
          </div>
        </div>
      </div>
      <div className="card__body" style={{ paddingBottom: "1.25rem" }}>
        <p className="ds-meta" style={{ marginBottom: "1rem" }}>
          Bar color reflects most-recent direction — green up, red down, gray neutral.
        </p>
        <ResponsiveContainer width="100%" height={data.length * 40 + 16}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
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
              width={52}
              tick={{ fontSize: 12, fontWeight: 600, fill: "var(--text-heading)" }}
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
              formatter={(value: any, _name: any, props: any) => [
                `${value as number} mention${(value as number) !== 1 ? "s" : ""}`,
                (props?.payload as TickerSummary)?.direction ?? "",
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => String(label)}
            />
            <Bar dataKey="mentions" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((entry) => (
                <Cell
                  key={entry.symbol}
                  fill={directionColor[entry.direction] ?? directionColor.neutral}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
