interface NewsletterSummaryProps {
  title: string;
  summary: string;
}

export function NewsletterSummary({ title, summary }: NewsletterSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Summary
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-base leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
