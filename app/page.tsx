"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, RefreshCw, Settings, X, ChartCandlestick } from "lucide-react";
import { ComponentRenderer, DigestRenderer } from "@/components/ComponentRenderer";
import { parseMood, parseProse, parseComponents } from "@/lib/parseResponse";
import type { TickerSummary } from "@/app/api/tickers/route";

type Mood = "normal" | "alert" | "opportunity" | "danger";

const BRIEFING_PROMPT = "What's in today's newsletter?";

const moodStyles: Record<Mood, string> = {
  normal: "bg-background",
  alert: "bg-amber-950/20",
  opportunity: "bg-emerald-950/20",
  danger: "bg-red-950/25",
};

const transport = new DefaultChatTransport({ api: "/api/agent" });

function getMessageText(m: {
  parts: Array<{ type: string; text?: string }>;
}): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function DigestLoading() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-8 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
        Compiling briefing…
      </div>
      <div className="mt-6 space-y-4">
        <div className="h-28 animate-pulse rounded-lg bg-muted/50" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-44 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-44 animate-pulse rounded-lg bg-muted/50" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-32 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-32 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-32 animate-pulse rounded-lg bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [cachedContent, setCachedContent] = useState<string | null>(null);
  const [cacheChecked, setCacheChecked] = useState(false);
  const [tickers, setTickers] = useState<TickerSummary[]>([]);
  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  const firstAssistant = messages.find((m) => m.role === "assistant");
  const agentText = firstAssistant ? getMessageText(firstAssistant) : "";
  const briefingText = agentText || cachedContent || "";
  const mood: Mood = parseMood(briefingText);

  // Fetch API spend on mount
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/usage");
        const data = await res.json();
        if (!cancelled) setTotalCost(data.totalCostUsd);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load today's cached digest — gate the button until resolved
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/digest");
        const data = await res.json();
        if (!cancelled && data?.rawText) setCachedContent(data.rawText);
      } catch { /* ignore */ }
      finally { if (!cancelled) setCacheChecked(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch weekly ticker mentions
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/tickers");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setTickers(data);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Refresh cost + tickers after a briefing completes
  useEffect(() => {
    if (status !== "ready") return;
    void fetch("/api/usage").then((r) => r.json()).then((d) => setTotalCost(d.totalCostUsd)).catch(() => {});
    void fetch("/api/tickers").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTickers(d); }).catch(() => {});
  }, [status]);

  // Escape key closes drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  function requestBriefing() {
    if (isLoading) return;
    sendMessage({ text: BRIEFING_PROMPT });
  }

  // Clears cached content so the user can request a fresh briefing
  function refreshBriefing() {
    if (isLoading) return;
    setCachedContent(null);
  }

  const showDigestLoading = isLoading && !briefingText.trim();

  const hasJsonDigest =
    /```json\n[\s\S]*?\n```/.test(briefingText) &&
    parseComponents(briefingText).length > 0;
  const summaryProse = parseProse(briefingText).trim();

  return (
    <div className={`flex h-screen flex-col transition-colors duration-700 ${moodStyles[mood]}`}>
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card/70 px-5 py-4 backdrop-blur-md sm:px-6">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:gap-3 sm:text-3xl">
            <ChartCandlestick className="size-8 shrink-0 sm:size-9" strokeWidth={1.75} aria-hidden />
            Market Analyzer
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Reads your newsletters, surfaces what matters
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {briefingText.trim() && (
            <button
              type="button"
              onClick={refreshBriefing}
              disabled={isLoading}
              title="Refresh briefing"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <RefreshCw className="size-5" strokeWidth={1.75} />
            </button>
          )}
          {totalCost !== null && (
            <div className="text-right">
              <div className="text-base font-medium uppercase tracking-wide text-muted-foreground">
                API spend
              </div>
              <div className="font-mono text-lg tabular-nums text-foreground">
                ${totalCost.toFixed(4)}
              </div>
            </div>
          )}
          <Link
            href="/settings"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="size-6" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      {/* Main content — always shows the full-page digest */}
      {!briefingText.trim() && !isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          {!cacheChecked ? (
            <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
          ) : (
            <button
              type="button"
              onClick={requestBriefing}
              disabled={isLoading}
              className="rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
            >
              Get today&apos;s briefing
            </button>
          )}
        </div>
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-6xl space-y-5">
            {showDigestLoading ? (
              <DigestLoading />
            ) : (
              <div className="space-y-6">
                <div
                  className="flex flex-wrap gap-2"
                  role="tablist"
                  aria-label="Briefing"
                >
                  <div
                    role="tab"
                    aria-selected={true}
                    tabIndex={0}
                    id="briefing-tab-digest"
                    aria-controls="briefing-panel-digest"
                    className="rounded-full border border-transparent bg-neutral-950 px-4 py-2 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-white dark:text-neutral-950"
                  >
                    Today&apos;s digest
                  </div>
                </div>
                <div
                  id="briefing-panel-digest"
                  role="tabpanel"
                  aria-labelledby="briefing-tab-digest"
                  className="space-y-10"
                >
                  {hasJsonDigest && summaryProse ? (
                    <>
                      <DigestRenderer content={briefingText} componentsOnly />
                      <section aria-labelledby="llm-summary-heading" className="space-y-3">
                        <h2
                          id="llm-summary-heading"
                          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          LLM summary
                        </h2>
                        <div className="rounded-xl border border-border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                          <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                            {summaryProse}
                          </p>
                        </div>
                      </section>
                    </>
                  ) : hasJsonDigest ? (
                    <DigestRenderer content={briefingText} componentsOnly />
                  ) : (
                    <DigestRenderer content={briefingText} />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Floating chat button */}
      {briefingText.trim() && !drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-95"
          aria-label="Open chat"
        >
          <MessageCircle className="size-6" strokeWidth={1.75} />
        </button>
      )}

      {/* Side drawer */}
      {drawerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close chat"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <h2 id="drawer-title" className="text-base font-semibold text-foreground">
                Chat
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                {/* Ticker chips */}
                {tickers.length > 0 && (
                  <div className="shrink-0 border-b border-border px-4 py-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Mentioned this week
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tickers.map((t) => (
                        <button
                          key={t.symbol}
                          type="button"
                          onClick={() => sendMessage({ text: `Tell me more about ${t.symbol}` })}
                          className={`rounded-md px-2.5 py-1 text-xs font-bold transition-opacity hover:opacity-80 ${
                            t.direction === "up"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : t.direction === "down"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="space-y-4">
                    {messages.map((m) => {
                      const text = getMessageText(m);
                      const isBriefingAssistant =
                        m.role === "assistant" && m.id === firstAssistant?.id;

                      if (m.role === "user") {
                        return (
                          <div key={m.id} className="flex justify-end">
                            <div className="max-w-[min(100%,18rem)] rounded-2xl bg-primary px-4 py-2.5 text-base leading-relaxed text-primary-foreground shadow-sm">
                              {text}
                            </div>
                          </div>
                        );
                      }

                      if (isBriefingAssistant) {
                        return (
                          <div
                            key={m.id}
                            className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground"
                          >
                            {showDigestLoading
                              ? "Loading briefing…"
                              : "Briefing is on the home page — Today's digest with the LLM summary card below."}
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} className="flex justify-start">
                          <div className="w-full max-w-none">
                            <ComponentRenderer content={text} />
                          </div>
                        </div>
                      );
                    })}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                        Thinking…
                      </div>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-border bg-card/90 px-4 py-3 backdrop-blur-sm">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a follow-up…"
                      className="min-w-0 flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:bg-muted/60 focus:ring-2 focus:ring-ring/40"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-base font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
                    >
                      Send
                    </button>
                  </form>
                </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
