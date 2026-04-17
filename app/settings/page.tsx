"use client";

import Link from "next/link";
import { ArrowLeft, ChartCandlestick } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/lib/theme";

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

export default function SettingsPage() {
  const { theme, setTheme, mounted } = useTheme();

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
        style={{ maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}
      >
        <section aria-labelledby="appearance-heading">
          <h2
            id="appearance-heading"
            className="ds-label"
            style={{ marginBottom: "1rem" }}
          >
            Appearance
          </h2>

          {!mounted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} aria-hidden>
              {[1, 2, 3].map((i) => (
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
                    {/* Radio indicator */}
                    <span
                      style={{
                        display: "flex",
                        width: "1rem",
                        height: "1rem",
                        flexShrink: 0,
                        alignItems: "center",
                        justifyContent: "center",
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
