interface RiskFlagProps {
  headline: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

const severityStyles = {
  low: "border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-100",
  medium: "border-orange-500/35 bg-orange-500/10 text-orange-950 dark:text-orange-100",
  high: "border-red-500/35 bg-red-500/10 text-red-950 dark:text-red-100",
};

const severityIcons = {
  low: "⚠️",
  medium: "🟠",
  high: "🔴",
};

export function RiskFlag({ headline, detail, severity }: RiskFlagProps) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${severityStyles[severity]}`}>
      <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Risk flag · {severity}
      </div>
      <div className="flex items-start gap-2">
        <span className="text-lg opacity-90" aria-hidden>
          {severityIcons[severity]}
        </span>
        <div>
          <h3 className="text-base font-semibold text-inherit">{headline}</h3>
          <p className="mt-1 text-base leading-relaxed text-inherit opacity-90">{detail}</p>
        </div>
      </div>
    </div>
  );
}
