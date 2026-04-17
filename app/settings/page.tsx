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
  {
    id: "grey",
    label: "Grey",
    description: "Neutral mid-grey palette",
  },
];

export default function SettingsPage() {
  const { theme, setTheme, mounted } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card/70 px-5 py-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex min-w-0 items-center gap-2.5">
            <ChartCandlestick
              className="size-7 shrink-0 sm:size-8"
              strokeWidth={1.75}
              aria-hidden
            />
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8 sm:px-6">
        <section aria-labelledby="appearance-heading">
          <h2
            id="appearance-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Appearance
          </h2>
          {!mounted ? (
            <div className="space-y-2" aria-hidden>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[4.5rem] animate-pulse rounded-xl bg-muted/60"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2" role="radiogroup" aria-label="Theme">
              {OPTIONS.map((opt) => {
                const selected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTheme(opt.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-ring/40"
                        : "border-border bg-card/50 hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {opt.label}
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {opt.description}
                      </div>
                    </div>
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      }`}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="size-1.5 rounded-full bg-primary-foreground" />
                      ) : null}
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
