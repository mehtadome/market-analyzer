# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in the **planning phase**. The full design is in `market-newsletter-agent.md`. No code has been scaffolded yet. Start at Phase 1.

## What This Builds

A Next.js app that reads market-focused newsletters from Gmail, sends them through a Claude agent loop, and renders dynamically selected React components based on what the newsletter contains (macro data, earnings, tickers, risk flags, etc.).

## Commands

Once scaffolded with Next.js:

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
```

Initial dependencies to install:

```bash
npm install ai @ai-sdk/anthropic zod googleapis
npx shadcn@latest init
```

## Architecture

```
Gmail API (googleapis)
    ↓
Next.js API Route: /app/api/agent/route.ts   ← Agent loop (streamText + tools, maxSteps: 5)
    ↓
Vercel AI SDK + claude-sonnet-4-6
    ↓
Tools: searchEmails → getEmail → parseNewsletterContent
    ↓
Model selects UI components → streams response
    ↓
React frontend: useChat hook in /app/page.tsx
```

**Key files once built:**
- `/app/api/agent/route.ts` — agent loop endpoint
- `/lib/tools.ts` — Zod-typed tool definitions + execute functions
- `/lib/gmail.ts` — Gmail API client (OAuth2 via `googleapis`)
- `/lib/systemPrompt.ts` — system prompt with component descriptions
- `/app/components/ui/` — the 6 presentational components Claude picks from

## Component Set

The model selects from exactly these components; descriptions live in `systemPrompt.ts`:

| Component | Triggered by |
|---|---|
| `MacroSummaryCard` | Fed, inflation, rates, GDP |
| `TickerMentionList` | Specific stock/ETF tickers |
| `SectorHeatmap` | Broad sector rotation/performance |
| `EarningsHighlight` | Earnings results, guidance, analyst reactions |
| `RiskFlag` | Geopolitical, regulatory, systemic risk |
| `NewsletterSummary` | Fallback for anything else |

Components are **dumb/presentational** — they only render props. Intelligence lives in the model's selection logic.

## Agent Tools

Three tools defined in `/lib/tools.ts`:
1. `searchEmails` — query Gmail for the latest newsletter (by sender/subject/label)
2. `getEmail` — fetch full email body by message ID
3. `parseNewsletterContent` — strip HTML, return clean readable text

Use `maxSteps: 5` in the agent config.

## Environment Variables

Required in `.env.local`:

```
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
NEWSLETTER_SENDER=        # e.g. hello@morningbrew.com
```

Gmail OAuth setup: Google Cloud Console → enable Gmail API → OAuth2 credentials → scope `gmail.readonly` → download credentials → generate refresh token manually and store it.

## Build Order

Follow the phases in `market-newsletter-agent.md`:
1. **Phase 1** — Scaffold Next.js + Vercel AI SDK, wire `useChat`, confirm Claude responds
2. **Phase 2** — Gmail integration, implement and test tools against a real email
3. **Phase 3** — Build the 6 UI components (keep them simple)
4. **Phase 4** — Wire generative UI: map model component selections to React renders
5. **Phase 5** — Polish: refresh trigger, error states, edge cases

> Do Phase 1 and 2 before touching generative UI — get the data pipeline working first. Gmail OAuth refresh token setup is the most friction-heavy part; do it manually once.
