# Market Newsletter Agent — Project Plan

## Concept

A Next.js application with a conversational interface that reads market-focused newsletter emails from Gmail, interprets their content using Claude, and renders dynamically chosen UI components based on what the newsletter contains. Instead of a static layout, the UI assembles itself based on what's actually in the news that day — a Fed commentary gets different treatment than an earnings beat or a geopolitical risk flag.

---

## Architecture Overview

```
Gmail (via MCP or API)
        ↓
  Next.js API Route (Agent Loop)
        ↓
  Vercel AI SDK + Claude
        ↓
  Tool calls: searchEmails → getEmail → parseContent
        ↓
  Model selects + streams UI components
        ↓
  React frontend (useChat hook)
```

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | Native fit for Vercel AI SDK RSC patterns |
| AI SDK | Vercel AI SDK | Handles agent loop, streaming, tool orchestration |
| Model | Claude (claude-sonnet-4-6) | Strong financial text comprehension, good tool use |
| Email Access | Gmail MCP server or Gmail API | MCP preferred for native tool integration |
| Styling | Tailwind + shadcn/ui | Fast component scaffolding |
| Dev Environment | Cursor | AI-assisted local development |
| Hosting (optional) | Vercel | Natural fit for Next.js |

---

## Component Library

Define these upfront — the model picks from this set based on newsletter content.

| Component | Triggered When |
|---|---|
| `<MacroSummaryCard />` | Fed, inflation, interest rate, GDP commentary |
| `<TickerMentionList />` | Specific stocks or ETFs are called out |
| `<SectorHeatmap />` | Broad sector performance discussed |
| `<EarningsHighlight />` | Earnings beats, misses, guidance changes |
| `<RiskFlag />` | Geopolitical risk, regulatory action, systemic concern |
| `<NewsletterSummary />` | Fallback — general prose summary when no specific pattern matches |

Each component needs a clear description string that becomes part of the system prompt, so Claude knows when to use it.

---

## Agent Tool Definitions

```typescript
// Tool 1 — find the latest newsletter
searchEmails: {
  description: "Search Gmail for the latest market newsletter email. Use sender, subject keywords, or label to filter.",
  inputSchema: z.object({
    query: z.string(), // e.g. "from:newsletter@morningbrew.com"
    maxResults: z.number().default(1)
  })
}

// Tool 2 — fetch full email body
getEmail: {
  description: "Fetch the full content of an email by its message ID.",
  inputSchema: z.object({
    messageId: z.string()
  })
}

// Tool 3 — optional: extract structured data from email HTML
parseNewsletterContent: {
  description: "Strip HTML and extract clean readable text from an email body.",
  inputSchema: z.object({
    rawHtml: z.string()
  })
}
```

---

## System Prompt

```
You are a financial markets assistant. Your job is to read market newsletter emails 
and present their content using the most appropriate UI components.

After reading the newsletter:
1. Identify the key themes (macro, earnings, sector moves, risk events, specific tickers)
2. For each major theme, select the most appropriate component from the available set
3. Return a structured response that combines brief prose context with the relevant components
4. If a theme doesn't match a specific component, use NewsletterSummary as a fallback

Available components and when to use them:
- MacroSummaryCard: Fed policy, inflation data, rate decisions, GDP/jobs reports
- TickerMentionList: Any specific stock or ETF tickers called out with context
- SectorHeatmap: Broad sector rotation or performance commentary
- EarningsHighlight: Company earnings results, guidance, analyst reactions
- RiskFlag: Geopolitical events, regulatory risk, systemic market concern
- NewsletterSummary: General narrative, opinion pieces, or content that doesn't fit above

Always prioritize signal over noise. Surface what a sophisticated investor would want to act on.
```

---

## Project Structure

```
/app
  /api
    /agent
      route.ts          ← Agent loop endpoint (streamText + tools)
  /page.tsx             ← Main chat interface
  /components
    /ui
      MacroSummaryCard.tsx
      TickerMentionList.tsx
      SectorHeatmap.tsx
      EarningsHighlight.tsx
      RiskFlag.tsx
      NewsletterSummary.tsx
    /chat
      MessageList.tsx
      ChatInput.tsx
/lib
  gmail.ts              ← Gmail API client or MCP wrapper
  tools.ts              ← Tool definitions (Zod schemas + execute functions)
  systemPrompt.ts       ← System prompt string
```

---

## Build Phases

### Phase 1 — Skeleton (Day 1)
- Scaffold Next.js app with Vercel AI SDK
- Wire up `useChat` hook on frontend
- Basic chat interface rendering plain text responses
- Confirm Claude is responding end-to-end

### Phase 2 — Gmail Integration (Day 1-2)
- Set up Gmail OAuth2 credentials (Google Cloud Console)
- Implement `searchEmails` and `getEmail` tool functions
- Test fetching a real newsletter email in isolation
- Confirm agent loop can call tools and get email content back

### Phase 3 — Component Library (Day 2)
- Build the 6 UI components as simple, visually clean cards
- Keep them dumb/presentational — they just render props
- Add component descriptions to system prompt

### Phase 4 — Generative UI Wiring (Day 2-3)
- Switch from plain `streamText` to streaming component responses
- Map model component selections to actual React renders
- Test with a real newsletter — verify the model picks appropriate components

### Phase 5 — Polish (Day 3)
- Add a "Refresh" trigger to fetch today's newsletter on demand
- Handle edge cases (no new email, parsing failures, rate limits)
- Basic error states in UI

---

## Gmail Auth Setup (Quick Reference)

1. Go to Google Cloud Console → Create project
2. Enable Gmail API
3. Create OAuth2 credentials (Desktop app or Web app)
4. Add scopes: `gmail.readonly`
5. Download credentials JSON
6. Store `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN` in `.env.local`
7. Use `googleapis` npm package for the API client

```bash
npm install googleapis
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
NEWSLETTER_SENDER=        # e.g. hello@morningbrew.com
```

---

## Key Dependencies

```bash
npm install ai @ai-sdk/anthropic zod googleapis
npx shadcn@latest init
```

---

## Stretch Goals

- **Multi-newsletter support** — track multiple senders, tag by source
- **Watchlist awareness** — user defines tickers they care about, model highlights those specifically
- **Historical view** — store past newsletter summaries, ask questions across time ("has inflation narrative shifted in the last month?")
- **Push trigger** — Gmail webhook (Pub/Sub) instead of manual refresh, so UI updates when the newsletter arrives
- **Portfolio context** — connect to a brokerage API, model contextualizes news against your actual holdings

---

## Notes for Claude CLI

- Start with Phase 1 and Phase 2 before touching generative UI — get the data pipeline working first
- The Gmail OAuth refresh token setup is the most friction-heavy part; do it manually once and store the token
- Keep components simple in Phase 3 — the intelligence is in the model's selection logic, not the component complexity
- Use `maxSteps: 5` in the agent config as a reasonable ceiling for the tool loop
