import { RichText } from "@/components/ui/RichText";

interface BriefingSummaryProps {
  headline: string;
  body: string;
}

export function BriefingSummary({ headline, body }: BriefingSummaryProps) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="ds-label">Today&apos;s Briefing</div>
      </div>
      <div className="card__body">
        <p className="ds-title" style={{ marginBottom: "0.6rem" }}><RichText text={headline} /></p>
        <p className="ds-prose"><RichText text={body} /></p>
      </div>
    </div>
  );
}
