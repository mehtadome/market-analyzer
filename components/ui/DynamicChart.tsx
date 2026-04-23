"use client";

import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  ScatterChart, Scatter,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export interface ChartSpec {
  chartType: "bar" | "line" | "pie" | "area" | "scatter";
  title: string;
  description?: string;
  xKey: string;
  yKey: string;
  colorBy?: string;
  orientation?: "horizontal" | "vertical";
  dataset: Record<string, unknown>[];
  colors?: Record<string, string>;
}

const PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
];

function pickColor(
  entry: Record<string, unknown>,
  colorBy: string | undefined,
  colors: Record<string, string> | undefined,
  index: number,
): string {
  if (colorBy && colors) {
    const val = String(entry[colorBy] ?? "");
    if (colors[val]) return colors[val];
  }
  return PALETTE[index % PALETTE.length];
}

const tooltipStyle = {
  background: "var(--background)",
  border: "1px solid var(--dc-border)",
  borderRadius: "6px",
  fontSize: "0.8125rem",
  color: "var(--text)",
};

const axisTick = { fontSize: 11, fill: "var(--text-muted)" } as const;

export function DynamicChart({
  chartType, title, description,
  xKey, yKey, colorBy, colors,
  orientation = "vertical", dataset,
}: ChartSpec) {
  if (!dataset || dataset.length === 0) {
    return (
      <div className="card" style={{ padding: "1.5rem" }}>
        <div className="ds-title">{title}</div>
        <p className="ds-prose" style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          No data available.
        </p>
      </div>
    );
  }

  let height = Math.max(220, dataset.length * 36);
  let chart: React.ReactNode;

  if (chartType === "pie") {
    height = 300;
    chart = (
      <PieChart>
        <Pie data={dataset} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={110}>
          {dataset.map((entry, i) => (
            <Cell key={i} fill={pickColor(entry, colorBy, colors, i)} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
      </PieChart>
    );
  } else if (chartType === "scatter") {
    chart = (
      <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <XAxis type="number" dataKey={xKey} name={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis type="number" dataKey={yKey} name={yKey} tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={dataset}>
          {dataset.map((entry, i) => (
            <Cell key={i} fill={pickColor(entry, colorBy, colors, i)} />
          ))}
        </Scatter>
      </ScatterChart>
    );
  } else if (chartType === "bar" && orientation === "horizontal") {
    height = dataset.length * 40 + 16;
    chart = (
      <BarChart layout="vertical" data={dataset} margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
        <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={xKey} width={64} tick={{ ...axisTick, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--btn-bg)" }} />
        <Bar dataKey={yKey} radius={[0, 4, 4, 0]} maxBarSize={24}>
          {dataset.map((entry, i) => (
            <Cell key={i} fill={pickColor(entry, colorBy, colors, i)} />
          ))}
        </Bar>
      </BarChart>
    );
  } else if (chartType === "bar") {
    chart = (
      <BarChart data={dataset} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={40}>
          {dataset.map((entry, i) => (
            <Cell key={i} fill={pickColor(entry, colorBy, colors, i)} />
          ))}
        </Bar>
      </BarChart>
    );
  } else if (chartType === "line") {
    chart = (
      <LineChart data={dataset} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={yKey} stroke={PALETTE[0]} strokeWidth={2} dot={false} />
      </LineChart>
    );
  } else {
    // area
    chart = (
      <AreaChart data={dataset} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={PALETTE[0]} fill={`${PALETTE[0]}33`} strokeWidth={2} />
      </AreaChart>
    );
  }

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <div className="ds-title">{title}</div>
          {description && (
            <div className="ds-meta" style={{ marginTop: "0.15rem" }}>{description}</div>
          )}
        </div>
      </div>
      <div className="card__body" style={{ paddingBottom: "1.25rem" }}>
        <ResponsiveContainer width="100%" height={height}>
          {chart as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
