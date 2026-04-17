"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ComponentRenderer } from "@/components/ComponentRenderer";

const transport = new DefaultChatTransport({ api: "/api/agent" });

export default function Home() {
  const [input, setInput] = useState("");
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/usage");
        const data = await res.json();
        if (!cancelled) setTotalCost(data.totalCostUsd);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/usage");
        const data = await res.json();
        if (!cancelled) setTotalCost(data.totalCostUsd);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card/70 px-5 py-4 backdrop-blur-md sm:px-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Market Analyzer
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Reads your newsletters, surfaces what matters
          </p>
        </div>
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
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 && (
            <div className="mt-20 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-3xl shadow-sm">
                📈
              </div>
              <p className="text-base text-foreground">
                Ask me to read today&apos;s market newsletter.
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                Try: &ldquo;What&apos;s in today&apos;s newsletter?&rdquo;
              </p>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("");

            return (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="max-w-[min(100%,20rem)] rounded-2xl bg-primary px-4 py-2.5 text-base leading-relaxed text-primary-foreground shadow-sm">
                    {text}
                  </div>
                ) : (
                  <div className="w-full max-w-xl">
                    <ComponentRenderer content={text} />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-base text-muted-foreground shadow-sm">
                <span
                  className="size-1.5 animate-pulse rounded-full bg-primary"
                  aria-hidden
                />
                Reading newsletter…
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl gap-2 sm:gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's in today's newsletter?"
            className="min-w-0 flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:bg-muted/60 focus:ring-2 focus:ring-ring/40"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
