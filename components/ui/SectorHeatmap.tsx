interface Sector {
  name: string;
  performance: string;
}

interface SectorHeatmapProps {
  sectors: Sector[];
}

function isPositive(perf: string) {
  return perf.startsWith("+");
}

export function SectorHeatmap({ sectors }: SectorHeatmapProps) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="ds-label" style={{ marginBottom: 0 }}>Sector Performance</div>
      </div>
      <div className="card__body">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sectors.map((s) => {
            const pos = isPositive(s.performance);
            return (
              <div
                key={s.name}
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: "6px",
                  border: `1px solid ${pos ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                  background: pos ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                  textAlign: "center",
                }}
              >
                <div className="ds-meta">{s.name}</div>
                <div
                  style={{
                    marginTop: "0.2rem",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: pos ? "var(--dc-positive)" : "var(--dc-border-high)",
                  }}
                >
                  {s.performance}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
