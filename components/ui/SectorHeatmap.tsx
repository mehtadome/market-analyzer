interface Sector {
  name: string;
  performance: string; // e.g. "+1.2%" or "-0.8%"
}

interface SectorHeatmapProps {
  sectors: Sector[];
}

function isPositive(perf: string) {
  return perf.startsWith("+");
}

export function SectorHeatmap({ sectors }: SectorHeatmapProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Sector Performance
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sectors.map((s) => (
          <div
            key={s.name}
            className={`rounded-lg border p-3 text-center ${
              isPositive(s.performance)
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/25 bg-red-500/10 text-red-200"
            }`}
          >
            <div className="text-sm font-medium opacity-90">{s.name}</div>
            <div className="mt-1 text-base font-bold tabular-nums">{s.performance}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
