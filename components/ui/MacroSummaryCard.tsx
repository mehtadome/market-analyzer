interface Indicator {
  label: string;
  value: string;
}

interface MacroSummaryCardProps {
  title: string;
  summary: string;
  indicators?: Indicator[];
}

export function MacroSummaryCard({ title, summary, indicators = [] }: MacroSummaryCardProps) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4 shadow-sm dark:border-blue-500/25 dark:bg-blue-500/5">
      <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
        Macro
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-3 text-base leading-relaxed text-muted-foreground">{summary}</p>
      {indicators.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {indicators.map((ind) => (
            <span
              key={ind.label}
              className="rounded-full bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-900 dark:text-blue-200"
            >
              {ind.label}: {ind.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
