export const directionStyle: Record<
  string,
  { border: string; color: string; bg: string }
> = {
  up: {
    border: "var(--dc-positive-border)",
    color: "var(--dc-positive)",
    bg: "var(--dc-positive-bg)",
  },
  down: {
    border: "var(--dc-danger-border)",
    color: "var(--dc-border-high)",
    bg: "var(--dc-danger-bg)",
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
  /** Tighter padding and type for chart Y-axis labels (matches bar row height). */
  compact?: boolean;
}

export function DigestTickerBadge({
  symbol,
  direction = "neutral",
  listSlot,
  compact,
}: DigestTickerBadgeProps) {
  const s = directionStyle[direction] ?? directionStyle.neutral;

  return (
    <span
      style={{
        flexShrink: 0,
        ...(listSlot ? { minWidth: "3.5rem" } : {}),
        ...(compact
          ? {
              padding: "0.0625rem 0.3125rem",
              borderRadius: "4px",
              fontSize: "0.6875rem",
              lineHeight: 1.2,
            }
          : {
              padding: "0.25rem 0.5rem",
              borderRadius: "6px",
              fontSize: "0.8125rem",
            }),
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      {symbol}
    </span>
  );
}
