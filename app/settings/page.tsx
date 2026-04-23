"use client";

import Link from "next/link";
import { ArrowLeft, ChartCandlestick } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/lib/theme";
import { REFRESH_WINDOWS, NEWSLETTER_SENDERS, CONTEXT_WINDOW_DAYS } from "@/lib/config";
import { WATCHLIST } from "@/lib/watchlist";
import { useEffect, useState } from "react";

const OPTIONS: { id: Theme; label: string; description: string }[] = [
  {
    id: "light",
    label: "Light",
    description: "Default bright theme",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Deep background with cool accents",
  },
];

function formatDigestTimestamp(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString)) + " PT";
}

function getContextLabel(): string {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long", timeZone: "America/Los_Angeles" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = parseInt(
    new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/Los_Angeles" }).format(now),
    10
  );
  const daysLeft = daysInMonth - dayOfMonth;
  return `${month} · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label
        className="ds-meta"
        style={{ fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.06em" }}
      >
        {label}
      </label>
      <input
        readOnly
        disabled
        value={value}
        style={{
          padding: "0.625rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          background: "var(--btn-bg)",
          color: "var(--text)",
          fontSize: "0.9rem",
          width: "100%",
          cursor: "default",
          opacity: 0.8,
        }}
      />
    </div>
  );
}

function SectionHeading({ id, label }: { id: string; label: string }) {
  return (
    <h2
      id={id}
      className="ds-label"
      style={{ marginBottom: "1rem" }}
    >
      {label}
    </h2>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, mounted } = useTheme();
  const [lastDigestTimestamp, setLastDigestTimestamp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/digest")
      .then((r) => r.json())
      .then((data) => {
        if (data?.timestamp) setLastDigestTimestamp(data.timestamp);
      })
      .catch(() => {});
  }, []);

  const contextLabel = getContextLabel();
  const refreshWindowsLabel = REFRESH_WINDOWS.map((w) => w.label).join(", ");

  return (
    <div className="shell" style={{ background: "var(--background)" }}>
      <header
        className="shell__header"
        style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}
      >
        <Link
          href="/"
          className="btn"
          style={{ padding: "0.35rem 0.45rem", display: "flex", alignItems: "center" }}
          aria-label="Back to home"
        >
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ChartCandlestick
            style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }}
            strokeWidth={1.75}
            aria-hidden
          />
          <h1
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--text-heading)",
              letterSpacing: "-0.02em",
            }}
          >
            Settings
          </h1>
        </div>
      </header>

      <main
        className="shell__main"
        style={{ maxWidth: "36rem", marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}
      >
        {/* Digest */}
        <section aria-labelledby="digest-heading">
          <SectionHeading id="digest-heading" label="Digest" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <ReadOnlyField
              label="Last briefing"
              value={lastDigestTimestamp ? formatDigestTimestamp(lastDigestTimestamp) : "No digest yet"}
            />
            <ReadOnlyField
              label="Refresh windows (PT)"
              value={refreshWindowsLabel}
            />
            <ReadOnlyField
              label={`Context window (${CONTEXT_WINDOW_DAYS}-day calendar month)`}
              value={contextLabel}
            />
          </div>
        </section>

        {/* Sources */}
        <section aria-labelledby="sources-heading">
          <SectionHeading id="sources-heading" label="Newsletter Sources" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {NEWSLETTER_SENDERS.map((sender) => (
              <ReadOnlyField key={sender} label="" value={sender} />
            ))}
          </div>
        </section>

        {/* Watchlist */}
        <section aria-labelledby="watchlist-heading">
          <SectionHeading id="watchlist-heading" label="Watchlist" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {WATCHLIST.map((entry) => (
              <span
                key={entry.symbol}
                style={{
                  padding: "0.3rem 0.7rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: "var(--btn-bg)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-heading)",
                  letterSpacing: "0.02em",
                }}
                title={entry.note}
              >
                {entry.symbol}
              </span>
            ))}
          </div>
        </section>

        {/* Appearance */}
        <section aria-labelledby="appearance-heading">
          <SectionHeading id="appearance-heading" label="Appearance" />

          {!mounted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} aria-hidden>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "4.5rem",
                    borderRadius: "8px",
                    background: "var(--btn-bg)",
                    opacity: 0.65,
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
              role="radiogroup"
              aria-label="Theme"
            >
              {OPTIONS.map((opt) => {
                const selected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTheme(opt.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      width: "100%",
                      padding: "0.875rem 1rem",
                      borderRadius: "8px",
                      border: selected
                        ? "2px solid var(--text-heading)"
                        : "1px solid var(--dc-border)",
                      background: selected ? "var(--btn-bg)" : "var(--background)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "var(--text-heading)",
                        }}
                      >
                        {opt.label}
                      </div>
                      <div className="ds-meta" style={{ marginTop: "0.2rem" }}>
                        {opt.description}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "flex",
                        width: "1rem",
                        height: "1rem",
                        flexShrink: 0,
                        alignItems: "center",
                        justifyContent: "center,",
                        borderRadius: "50%",
                        border: selected
                          ? "2px solid var(--text-heading)"
                          : "2px solid var(--dc-border-low)",
                        background: selected ? "var(--text-heading)" : "transparent",
                      }}
                      aria-hidden
                    >
                      {selected && (
                        <span
                          style={{
                            width: "0.375rem",
                            height: "0.375rem",
                            borderRadius: "50%",
                            background: "var(--background)",
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
