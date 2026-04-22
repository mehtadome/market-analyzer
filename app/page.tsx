"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, RefreshCw, Settings, X, ChartCandlestick } from "lucide-react";
import { ComponentRenderer, DigestRenderer } from "@/components/ComponentRenderer";
import { TickerMentionChart } from "@/components/ui/TickerMentionChart";
import { parseMood } from "@/lib/parseResponse";
import type { TickerSummary } from "@/app/api/tickers/route";

type Mood = "normal" | "alert" | "opportunity" | "danger";

const BRIEFING_PROMPT = "What's in today's newsletter?";

const moodStyles: Record<Mood, string> = {
  normal:      "",
  alert:       "bg-amber-950/20",
  opportunity: "bg-emerald-950/20",
  danger:      "bg-red-950/25",
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
    <div className="card" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "ui-monospace, monospace", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        <span
          style={{
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "50%",
            background: "var(--text-muted)",
            display: "inline-block",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
          aria-hidden
        />
        Compiling briefing…
      </div>
      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="skeleton-block" style={{ height: "7rem", borderRadius: "6px", background: "var(--btn-bg)", opacity: 0.7 }} />
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className="skeleton-block" style={{ height: "11rem", borderRadius: "6px", background: "var(--btn-bg)", opacity: 0.7 }} />
          <div className="skeleton-block" style={{ height: "11rem", borderRadius: "6px", background: "var(--btn-bg)", opacity: 0.7 }} />
        </div>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="skeleton-block" style={{ height: "8rem", borderRadius: "6px", background: "var(--btn-bg)", opacity: 0.7 }} />
          <div className="skeleton-block" style={{ height: "8rem", borderRadius: "6px", background: "var(--btn-bg)", opacity: 0.7 }} />
          <div className="skeleton-block" style={{ height: "8rem", borderRadius: "6px", background: "var(--btn-bg)", opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");                                    // controlled chat input value
  const [activeTab, setActiveTab] = useState<"digest" | "tickers">("digest"); // which tab is shown in the drawer
  const [drawerOpen, setDrawerOpen] = useState(false);                        // whether the side drawer is open
  const [totalCost, setTotalCost] = useState<number | null>(null);            // cumulative API spend from /api/usage
  const [cachedContent, setCachedContent] = useState<string | null>(null);   // today's digest rawText from L2 cache
  const [cacheChecked, setCacheChecked] = useState(false);                   // whether the cache check on mount has completed
  const [tickers, setTickers] = useState<TickerSummary[]>([]);               // 7-day ticker mention data for the chart
  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  const firstAssistant = messages.find((m) => m.role === "assistant");
  const agentText = firstAssistant ? getMessageText(firstAssistant) : "";
  const briefingText = agentText || cachedContent || "";
  const mood: Mood = parseMood(briefingText);

  useEffect(() => {
    // cancelled guards against stale async results — if the component unmounts before
    // the fetch resolves, the cleanup sets cancelled=true and the setState is discarded.
    // Async operations don't respect React's component lifecycle, so this must be done manually.
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

  useEffect(() => {
    if (status !== "ready") return;
    void fetch("/api/usage").then((r) => r.json()).then((d) => setTotalCost(d.totalCostUsd)).catch(() => {});
    void fetch("/api/tickers").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTickers(d); }).catch(() => {});
  }, [status]);

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

  function refreshBriefing() {
    if (isLoading) return;
    setCachedContent(null);
  }

  const showDigestLoading = isLoading && !briefingText.trim();

  return (
    <div
      className={`flex h-screen flex-col transition-colors duration-700 ${moodStyles[mood]}`}
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="shell__header shrink-0"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
      >
        <div>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
              fontWeight: 700,
              color: "var(--text-heading)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            <ChartCandlestick
              style={{ width: "2rem", height: "2rem", flexShrink: 0 }}
              strokeWidth={1.75}
              aria-hidden
            />
            Market Analyzer
          </h1>
          <p style={{ marginTop: "0.35rem", fontSize: "1rem", color: "var(--text-muted)" }}>
            Reads your newsletters, surfaces what matters
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          {briefingText.trim() && (
            <button
              type="button"
              onClick={refreshBriefing}
              disabled={isLoading}
              title="Refresh briefing"
              className="btn"
              style={{ padding: "0.4rem 0.5rem", display: "flex", alignItems: "center" }}
            >
              <RefreshCw style={{ width: "1rem", height: "1rem" }} strokeWidth={1.75} />
            </button>
          )}
          {totalCost !== null && (
            <div style={{ textAlign: "right" }}>
              <div className="ds-meta" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                API spend
              </div>
              <div
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.9375rem",
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--text-heading)",
                }}
              >
                ${totalCost.toFixed(4)}
              </div>
            </div>
          )}
          <Link
            href="/settings"
            className="btn"
            style={{ padding: "0.4rem 0.5rem", display: "flex", alignItems: "center" }}
            aria-label="Settings"
          >
            <Settings style={{ width: "1.125rem", height: "1.125rem" }} strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      {/* Main content — always rendered so tickers tab is always accessible */}
      <main className="shell__main min-h-0 flex-1 overflow-y-auto">
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <div className="space-y-6">
            {/* Tab row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }} role="tablist" aria-label="Briefing">
              <div
                role="tab"
                aria-selected={activeTab === "digest"}
                tabIndex={0}
                id="briefing-tab-digest"
                aria-controls="briefing-panel-digest"
                className={`tab${activeTab === "digest" ? " tab--active" : ""}`}
                onClick={() => setActiveTab("digest")}
                onKeyDown={(e) => e.key === "Enter" && setActiveTab("digest")}
              >
                Today&apos;s digest
              </div>
              <div
                role="tab"
                aria-selected={activeTab === "tickers"}
                tabIndex={0}
                id="briefing-tab-tickers"
                aria-controls="briefing-panel-tickers"
                className={`tab${activeTab === "tickers" ? " tab--active" : ""}`}
                onClick={() => setActiveTab("tickers")}
                onKeyDown={(e) => e.key === "Enter" && setActiveTab("tickers")}
              >
                Today&apos;s tickers
              </div>
            </div>

            {activeTab === "digest" && (
              <div
                id="briefing-panel-digest"
                role="tabpanel"
                aria-labelledby="briefing-tab-digest"
                className="space-y-10"
              >
                {showDigestLoading ? (
                  <DigestLoading />
                ) : briefingText.trim() ? (
                  <DigestRenderer content={briefingText} />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4rem 1.5rem",
                    }}
                  >
                    {!cacheChecked ? (
                      <span
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          borderRadius: "50%",
                          background: "var(--text-muted)",
                          display: "inline-block",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                        aria-hidden
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={requestBriefing}
                        disabled={isLoading}
                        style={{
                          padding: "0.75rem 2rem",
                          borderRadius: "6px",
                          border: "1px solid var(--dc-border)",
                          background: "var(--text-heading)",
                          color: "var(--background)",
                          fontSize: "1rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      >
                        Get today&apos;s briefing
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tickers" && (
              <div
                id="briefing-panel-tickers"
                role="tabpanel"
                aria-labelledby="briefing-tab-tickers"
                className="space-y-6"
              >
                <TickerMentionChart tickers={tickers} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating chat button */}
      {briefingText.trim() && !drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 30,
            width: "3.25rem",
            height: "3.25rem",
            borderRadius: "50%",
            border: "1px solid var(--dc-border)",
            background: "var(--text-heading)",
            color: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          aria-label="Open chat"
        >
          <MessageCircle style={{ width: "1.25rem", height: "1.25rem" }} strokeWidth={1.75} />
        </button>
      )}

      {/* Side drawer */}
      {drawerOpen && (
          <aside
            style={{
              position: "fixed",
              bottom: "5.5rem",
              right: "1.5rem",
              zIndex: 50,
              width: "clamp(18rem, 90vw, 22rem)",
              height: "32rem",
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--dc-border)",
              borderRadius: "8px",
              background: "var(--background)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Drawer header */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--dc-border)",
                background: "var(--btn-bg)",
              }}
            >
              <h2 id="drawer-title" className="ds-title" style={{ fontSize: "0.9375rem" }}>
                Chat
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn"
                style={{ padding: "0.3rem 0.4rem", display: "flex", alignItems: "center" }}
                aria-label="Close"
              >
                <X style={{ width: "1rem", height: "1rem" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              {/* Ticker chips */}
              {tickers.length > 0 && (
                <div
                  style={{
                    flexShrink: 0,
                    borderBottom: "1px solid var(--dc-border)",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <p className="ds-meta" style={{ marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Mentioned this week
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {tickers.map((t) => (
                      <button
                        key={t.symbol}
                        type="button"
                        onClick={() => sendMessage({ text: `Tell me more about ${t.symbol}` })}
                        style={{
                          padding: "0.15rem 0.55rem",
                          borderRadius: "4px",
                          border: `1px solid ${
                            t.direction === "up"
                              ? "rgba(34,197,94,0.4)"
                              : t.direction === "down"
                                ? "rgba(239,68,68,0.4)"
                                : "var(--dc-border)"
                          }`,
                          background:
                            t.direction === "up"
                              ? "rgba(34,197,94,0.10)"
                              : t.direction === "down"
                                ? "rgba(239,68,68,0.10)"
                                : "var(--btn-bg)",
                          color:
                            t.direction === "up"
                              ? "var(--dc-positive)"
                              : t.direction === "down"
                                ? "var(--dc-border-high)"
                                : "var(--text-muted)",
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      >
                        {t.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div style={{ minHeight: 0, flex: 1, overflowY: "auto", padding: "1rem" }}>
                <div className="space-y-4">
                  {messages.map((m) => {
                    const text = getMessageText(m);
                    const isBriefingAssistant =
                      m.role === "assistant" && m.id === firstAssistant?.id;

                    if (m.role === "user") {
                      return (
                        <div key={m.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                          <div
                            style={{
                              maxWidth: "min(100%, 18rem)",
                              padding: "0.6rem 0.9rem",
                              borderRadius: "12px 12px 2px 12px",
                              background: "var(--text-heading)",
                              color: "var(--background)",
                              fontSize: "0.9375rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {text}
                          </div>
                        </div>
                      );
                    }

                    if (isBriefingAssistant) {
                      return (
                        <div
                          key={m.id}
                          style={{
                            padding: "0.6rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px dashed var(--dc-border)",
                            background: "var(--btn-bg)",
                          }}
                          className="ds-meta"
                        >
                          {showDigestLoading
                            ? "Loading briefing…"
                            : "Briefing is on the home page — Today's digest with the LLM summary card below."}
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{ width: "100%" }}>
                          <ComponentRenderer content={text} />
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                      className="ds-meta"
                    >
                      <span
                        style={{
                          width: "0.375rem",
                          height: "0.375rem",
                          borderRadius: "50%",
                          background: "var(--text-muted)",
                          display: "inline-block",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                      Thinking…
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div
                style={{
                  flexShrink: 0,
                  borderTop: "1px solid var(--dc-border)",
                  background: "var(--btn-bg)",
                  padding: "0.75rem 1rem",
                }}
              >
                <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up…"
                    style={{
                      minWidth: 0,
                      flex: 1,
                      borderRadius: "6px",
                      border: "1px solid var(--dc-border)",
                      background: "var(--background)",
                      padding: "0.5rem 0.875rem",
                      fontSize: "0.9375rem",
                      color: "var(--text)",
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--dc-border-low)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--dc-border)"; }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="btn"
                    style={{ flexShrink: 0 }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </aside>
      )}
    </div>
  );
}
