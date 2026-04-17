"use client";

import { MacroSummaryCard } from "@/components/ui/MacroSummaryCard";
import { TickerMentionList } from "@/components/ui/TickerMentionList";
import { SectorHeatmap } from "@/components/ui/SectorHeatmap";
import { EarningsHighlight } from "@/components/ui/EarningsHighlight";
import { RiskFlag } from "@/components/ui/RiskFlag";
import { NewsletterSummary } from "@/components/ui/NewsletterSummary";

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
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

  if (!jsonMatch) {
    return (
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {content}
      </p>
    );
  }

  // Prose before the JSON block
  const prose = content.slice(0, jsonMatch.index).trim();

  let parsed: { components: ComponentSpec[] } | null = null;
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch {
    return (
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {prose && (
        <p className="text-base leading-relaxed text-foreground">{prose}</p>
      )}
      {parsed?.components.map((spec, i) => (
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
    default:
      return null;
  }
}
