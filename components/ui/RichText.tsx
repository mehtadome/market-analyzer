"use client";

import React from "react";
import { useTickerMap } from "@/lib/TickerContext";
import { DigestTickerBadge } from "@/components/ui/DigestTickerBadge";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function RichText({ text }: { text: string }) {
  const tickers = useTickerMap();

  if (!text) return null;

  const symbols = Array.from(tickers.keys());

  // No known tickers — fall back to bold-only rendering
  if (symbols.length === 0) {
    return <>{renderBoldOnly(text)}</>;
  }

  const tickerAlts = symbols.map(escapeRegex).join("|");
  const re = new RegExp(`\\*\\*(.+?)\\*\\*|(${tickerAlts})`, "g");

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));

    if (match[1] !== undefined) {
      nodes.push(<strong key={match.index}>{match[1]}</strong>);
    } else {
      const symbol = match[0];
      const dir = tickers.get(symbol) ?? "neutral";
      nodes.push(
        <DigestTickerBadge
          key={match.index}
          symbol={symbol}
          direction={dir}
          inline
        />
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));

  return <>{nodes}</>;
}

function renderBoldOnly(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}
