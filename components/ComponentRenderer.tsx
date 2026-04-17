"use client";

import { MacroSummaryCard } from "@/components/ui/MacroSummaryCard";
import { TickerMentionList } from "@/components/ui/TickerMentionList";
import { SectorHeatmap } from "@/components/ui/SectorHeatmap";
import { EarningsHighlight } from "@/components/ui/EarningsHighlight";
import { RiskFlag } from "@/components/ui/RiskFlag";
import { NewsletterSummary } from "@/components/ui/NewsletterSummary";
import { BriefingSummary } from "@/components/ui/BriefingSummary";
import { parseMood, parseComponents } from "@/lib/parseResponse";

export { parseMood };

interface ComponentSpec {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface ComponentRendererProps {
  content: string;
}

/**
 * Parses a JSON component spec block out of the assistant's message
 * and renders the appropriate UI components.
 */
export function ComponentRenderer({ content }: ComponentRendererProps) {
  const components = parseComponents(content) as ComponentSpec[];

  if (components.length === 0) {
    return (
      <p className="ds-prose" style={{ whiteSpace: "pre-wrap" }}>
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {components.map((spec, i) => (
        <div key={i}>{renderComponent(spec)}</div>
      ))}
    </div>
  );
}

function renderComponent(spec: ComponentSpec) {
  switch (spec.type) {
    case "MacroSummaryCard":
      return <MacroSummaryCard {...spec.data} />;
    case "TickerMentionList":
      return <TickerMentionList {...spec.data} />;
    case "SectorHeatmap":
      return <SectorHeatmap {...spec.data} />;
    case "EarningsHighlight":
      return <EarningsHighlight {...spec.data} />;
    case "RiskFlag":
      return <RiskFlag {...spec.data} />;
    case "NewsletterSummary":
      return <NewsletterSummary {...spec.data} />;
    case "BriefingSummary":
      return <BriefingSummary {...spec.data} />;
    default:
      return null;
  }
}

/** Dashboard layout: full-width macro/risk/summary; tickers + sectors paired; earnings in a row. */
export function DigestLayout({ components }: { components: ComponentSpec[] }) {
  const rows: React.ReactNode[] = [];
  let i = 0;

  while (i < components.length) {
    const spec = components[i];
    const next = components[i + 1];

    if (
      (spec.type === "TickerMentionList" && next?.type === "SectorHeatmap") ||
      (spec.type === "SectorHeatmap" && next?.type === "TickerMentionList")
    ) {
      const ticker =
        spec.type === "TickerMentionList" ? spec : next;
      const sector =
        spec.type === "SectorHeatmap" ? spec : next;
      rows.push(
        <div
          key={`pair-${i}`}
          className="grid gap-4 lg:grid-cols-2 lg:items-start"
        >
          <div className="min-w-0">{renderComponent(ticker)}</div>
          <div className="min-w-0">{renderComponent(sector)}</div>
        </div>,
      );
      i += 2;
      continue;
    }

    if (spec.type === "EarningsHighlight") {
      const group: ComponentSpec[] = [];
      let j = i;
      while (j < components.length && components[j].type === "EarningsHighlight") {
        group.push(components[j]);
        j++;
      }
      rows.push(
        <div
          key={`earn-${i}`}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {group.map((s, k) => (
            <div key={k} className="min-w-0">
              {renderComponent(s)}
            </div>
          ))}
        </div>,
      );
      i = j;
      continue;
    }

    rows.push(
      <div key={`full-${i}`} className="w-full min-w-0">
        {renderComponent(spec)}
      </div>,
    );
    i++;
  }

  return <div className="space-y-6">{rows}</div>;
}

interface DigestRendererProps {
  content: string;
  /** When true, only the structured digest grid (no intro prose). */
  componentsOnly?: boolean;
}

/** Parses the assistant JSON block and renders a Bloomberg-style digest grid (not chat bubbles). */
export function DigestRenderer({ content, componentsOnly = false }: DigestRendererProps) {
  const hasJsonFence = /```json\n[\s\S]*?\n```/.test(content);
  const components = parseComponents(content) as ComponentSpec[];

  if (!hasJsonFence || components.length === 0) {
    if (componentsOnly) {
      return (
        <p className="ds-prose" style={{ color: "var(--text-muted)" }}>
          No structured digest for today yet — check the LLM summary below, or run a new briefing.
        </p>
      );
    }
    return (
      <div className="card" style={{ padding: "1.5rem" }}>
        <p className="ds-prose" style={{ whiteSpace: "pre-wrap" }}>
          {content}
        </p>
      </div>
    );
  }

  if (componentsOnly) {
    return <DigestLayout components={components} />;
  }

  return <DigestLayout components={components} />;
}
