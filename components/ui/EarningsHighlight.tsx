interface EarningsHighlightProps {
  company: string;
  result: "beat" | "miss" | "inline";
  detail: string;
}

const resultToImportance: Record<string, string> = {
  beat:   "low",
  miss:   "high",
  inline: "",
};

const importanceColor: Record<string, string> = {
  low:  "var(--dc-border-low)",
  high: "var(--dc-border-high)",
  "":   "var(--text-muted)",
};

const resultLabel: Record<string, string> = {
  beat:   "Beat",
  miss:   "Miss",
  inline: "In Line",
};

export function EarningsHighlight({ company, result, detail }: EarningsHighlightProps) {
  const importance = resultToImportance[result] ?? "";
  const label = resultLabel[result] ?? result;
  const cardClass = importance ? `card card--${importance}` : "card";

  return (
    <div className={cardClass}>
      <div className="card__header">
        <div>
          <div className="ds-label" style={{ marginBottom: 0, color: importanceColor[importance] }}>Earnings</div>
          <div className="ds-title">{company}</div>
        </div>
        <span
          style={{
            padding: "0.15rem 0.6rem",
            borderRadius: "999px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            flexShrink: 0,
            marginTop: "0.25rem",
            background:
              result === "beat"
                ? "rgba(34,197,94,0.12)"
                : result === "miss"
                  ? "rgba(239,68,68,0.12)"
                  : "var(--btn-bg)",
            color:
              result === "beat"
                ? "var(--dc-positive)"
                : result === "miss"
                  ? "var(--dc-border-high)"
                  : "var(--text-muted)",
            border: "1px solid currentColor",
          }}
        >
          {label}
        </span>
      </div>
      <div className="card__body">
        <p className="ds-prose">{detail}</p>
      </div>
    </div>
  );
}
