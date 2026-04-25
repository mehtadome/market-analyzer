interface Ticker {
  symbol: string;
  context: string;
  direction?: "up" | "down" | "neutral";
}

interface TickerMentionListProps {
  tickers: Ticker[];
}

import { directionStyle } from "@/components/ui/DigestTickerBadge";

export function TickerMentionList({ tickers }: TickerMentionListProps) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="ds-label" style={{ marginBottom: 0 }}>Tickers</div>
      </div>
      <div className="card__body">
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {tickers.map((t) => {
            const s = directionStyle[t.direction ?? "neutral"] ?? directionStyle.neutral;
            return (
              <li key={t.symbol} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span
                  style={{
                    flexShrink: 0,
                    minWidth: "3.5rem",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "4px",
                    border: `1px solid ${s.border}`,
                    background: s.bg,
                    color: s.color,
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {t.symbol}
                </span>
                <span className="ds-prose" style={{ paddingTop: "0.05rem" }}>{t.context}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
