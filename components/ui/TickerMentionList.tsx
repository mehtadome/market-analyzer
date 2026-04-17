interface Ticker {
  symbol: string;
  context: string;
  direction?: "up" | "down" | "neutral";
}

interface TickerMentionListProps {
  tickers: Ticker[];
}

export function TickerMentionList({ tickers }: TickerMentionListProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Tickers
      </div>
      <ul className="space-y-2">
        {tickers.map((t) => (
          <li key={t.symbol} className="flex items-start gap-3">
            <span
              className={`mt-0.5 min-w-[56px] rounded px-2 py-0.5 text-center text-sm font-bold ${
                t.direction === "up"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : t.direction === "down"
                    ? "bg-red-500/15 text-red-300"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {t.symbol}
            </span>
            <span className="text-base leading-relaxed text-foreground">{t.context}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
