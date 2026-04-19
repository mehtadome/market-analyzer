const directionStyle: Record<
  string,
  { border: string; color: string; bg: string }
> = {
  up: {
    border: "#22c55e44",
    color: "#16a34a",
    bg: "rgba(34,197,94,0.10)",
  },
  down: {
    border: "#ef444444",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.10)",
  },
  neutral: {
    border: "var(--dc-border)",
    color: "var(--text-muted)",
    bg: "var(--btn-bg)",
  },
};

export type DigestTickerDirection = "up" | "down" | "neutral";

interface DigestTickerBadgeProps {
  symbol: string;
  direction?: DigestTickerDirection;
  /** Use in TickerMentionList rows so context lines align. */
  listSlot?: boolean;
}

export function DigestTickerBadge({
  symbol,
  direction = "neutral",
  listSlot,
}: DigestTickerBadgeProps) {
  const s = directionStyle[direction] ?? directionStyle.neutral;

  return (
    <span
      style={{
        flexShrink: 0,
        ...(listSlot ? { minWidth: "3.5rem" } : {}),
        padding: "0.25rem 0.5rem",
        borderRadius: "6px",
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontSize: "0.8125rem",
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      {symbol}
    </span>
  );
}
