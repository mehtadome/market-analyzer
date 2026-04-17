interface EarningsHighlightProps {
  company: string;
  result: "beat" | "miss" | "inline";
  detail: string;
}

const resultStyles = {
  beat: {
    bg: "border-emerald-500/30 bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-300",
    label: "Beat",
  },
  miss: {
    bg: "border-red-500/30 bg-red-500/5",
    badge: "bg-red-500/15 text-red-300",
    label: "Miss",
  },
  inline: {
    bg: "border-border bg-muted/40",
    badge: "bg-muted text-muted-foreground",
    label: "In Line",
  },
};

export function EarningsHighlight({ company, result, detail }: EarningsHighlightProps) {
  const styles = resultStyles[result] ?? resultStyles.inline;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${styles.bg}`}>
      <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Earnings
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{company}</h3>
        <span className={`rounded-full px-2 py-0.5 text-sm font-bold ${styles.badge}`}>
          {styles.label}
        </span>
      </div>
      <p className="text-base leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}
