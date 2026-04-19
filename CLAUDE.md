# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
npm run dev        # start dev server at localhost:3000
npm run build      # production build
npm run lint       # ESLint
node node_modules/typescript/lib/tsc.js --noEmit   # type-check (npx tsc --noEmit also works)
npm test                                            # Vitest unit tests (lib/__tests__/)
```

No test suite exists. Type-check before declaring work done.

## Architecture

### Request flow

1. User clicks "Get today's briefing" → `sendMessage({ text: "What's in today's newsletter?" })`
2. `POST /api/agent` streams via Vercel AI SDK (`streamText` with `claude-haiku-4-5`)
3. Agent calls `searchEmails` then `getEmail` (Gmail OAuth via `lib/gmail.ts`) — max 5 tool steps
4. `onFinish` parses the completed text → saves to `digests/YYYY-MM-DD.json` and L1 memory cache
5. `page.tsx` renders the raw text through `DigestRenderer` → `DigestLayout` → individual card components

On subsequent page loads, `GET /api/digest` checks L1 (`lib/cache.ts` module-level `Map`) then L2 (file in `digests/`) and returns `rawText` without touching Gmail or the model. Cache auto-evicts non-today entries on write.

### Generative UI

The model always responds with a single `\`\`\`json` block — no prose outside it. The block has this shape:

```json
{ "mood": "normal|alert|opportunity|danger", "components": [{ "type": "...", "data": {...} }] }
```

`lib/parseResponse.ts` extracts this block. `ComponentRenderer.tsx` maps each `type` to its React component via a `switch`. `DigestLayout` handles the grid arrangement (tickers + sectors paired side-by-side, earnings in a 3-col grid, everything else full-width).

**To add a new component type:** create the component in `components/ui/`, register it in the `renderComponent` switch in `ComponentRenderer.tsx`, and describe it with its data shape in `lib/systemPrompt.ts`.

### Ticker history

`GET /api/tickers` scans the last 7 days of digest files, aggregates `TickerMentionList` entries by symbol, and returns mention counts + most-recent direction. The `TickerMentionChart` (Recharts bar chart) and ticker chips in the drawer both read from this endpoint.

### Watchlist

Edit `lib/watchlist.ts` to change the watchlist. It's injected directly into the system prompt at startup — the model uses it to flag relevant tickers and prioritize placement.

## Styling

All styling uses CSS custom properties defined in `app/globals.css`. **Do not use Tailwind color/spacing utilities** — use the design-system tokens and semantic class names instead.

Key tokens: `--text`, `--text-heading`, `--text-muted`, `--bg`, `--border`, `--btn-bg`, `--btn-bg-hover`. Card severity uses `--digest-card-border-low/medium/high`. Full reference in `styling.md`.

Semantic classes: `.card`, `.card__header`, `.card__body`, `.card__footer`, `.btn`, `.tab`, `.tab--active`, `.shell__header`, `.shell__main`, `.ds-title`, `.ds-prose`, `.ds-meta`. Use these rather than inline styles where possible; inline styles are acceptable for one-off values not covered by a class.

Dark mode is handled automatically via `prefers-color-scheme` — no class toggling needed.

## Key files

| Path | Purpose |
|------|---------|
| `lib/systemPrompt.ts` | Full agent instructions + component schema sent to the model |
| `lib/watchlist.ts` | Tickers the agent prioritizes |
| `lib/digest.ts` | Read/write `digests/YYYY-MM-DD.json` (L2 cache) |
| `lib/cache.ts` | Module-level L1 cache (memory, process lifetime) |
| `lib/gmail.ts` | Gmail OAuth + `searchEmails`/`getEmail` |
| `lib/usage.ts` | Append-only token/cost log in `usage.json` |
| `components/ComponentRenderer.tsx` | Parses JSON block → renders component grid |
| `app/api/agent/route.ts` | Streaming LLM endpoint |
| `app/api/digest/route.ts` | Cache-first digest retrieval |
| `app/api/tickers/route.ts` | 7-day ticker aggregation |

## Environment variables

Required in `.env.local`:
- `ANTHROPIC_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (Gmail OAuth)
