# Routes & Architecture

## Dependencies & Versions
All package versions and dependency trees: [package-lock.json](./package-lock.json)

## Project Structure
- **[`lib/`](./lib)** — pure TypeScript modules: business logic, utilities, and data access. No HTTP, no React. Importable from anywhere.
- **[`app/`](./app)** — Next.js App Router: React pages and API route handlers (`app/api/*/route.ts`). Tied to the request/response lifecycle.

## System Prompt
[lib/systemPrompt.ts](./lib/systemPrompt.ts)

## Evals
[evals/fixtures/](./evals/fixtures) — plain text files simulating real newsletter emails; the input the model receives during an eval run.
[evals/rubrics/](./evals/rubrics) — JSON files defining expected model output (mood, component types, field values) for each fixture. Human-readable `description` fields are for the developer, not the model.
[evals/run.ts](./evals/run.ts) — feeds each fixture to the real Claude API and checks the response against the rubric assertions. Run with `npm run eval`.

## In-Memory Cache
[lib/cache.ts](./lib/cache.ts)

## Client-Side AI Hook
`useChat` in [`app/page.tsx`](./app/page.tsx) — Vercel AI SDK React hook. Client-side counterpart to `streamText` on the server. Sends messages to `/api/agent`, receives the chunked stream, and exposes `messages`, `sendMessage`, and `status` to the UI.

## Component Rendering
[components/ComponentRenderer.tsx](./components/ComponentRenderer.tsx) — maps model JSON to React cards via a `renderComponent` switch (`spec.data` spread as props). Called from [`app/page.tsx:520`](./app/page.tsx) inside the message rendering loop. The `type` and `data` fields from each digest component (visible in `digests/YYYY-MM-DD.json`) flow through the `ComponentSpec` interface and get styled by the matching card in `components/ui/`.

## Card Components & Styling
[components/ui/](./components/ui) — one file per card type (`RiskFlag.tsx`, `MacroSummaryCard.tsx`, etc.). Each component owns its own structure and styling via design system tokens.

## Raw Model Response
`digests/YYYY-MM-DD.json` → `rawText` field — the exact full model response including the ` ```json ``` ` fence. Useful for debugging what the model actually returned.

## Agent Endpoint
[app/api/agent/route.ts](./app/api/agent/route.ts) — defines the model, usage tracking, and max loop count. Also calls `saveDigest` and `setCached` in `onFinish`, so it's responsible for persisting the result to L2 and warming L1 after the agent completes.

## Digest Cache Logic
[app/api/digest/route.ts](./app/api/digest/route.ts) — cache-first retrieval endpoint. Checks L1 (module-level Map) then L2 (filesystem). Bypasses L1 during PT refresh windows (2–7am, 1–4pm) so the next briefing pulls fresh from Gmail, but still serves L2 so new tabs always have content.

## Ticker Aggregation
[app/api/tickers/route.ts](./app/api/tickers/route.ts) — scans the last 7 days of digest files, aggregates `TickerMentionList` entries by symbol (mention count + most recent direction), and returns the result for the bar chart.

## Gmail Integration
[lib/gmail.ts](./lib/gmail.ts) — OAuth2 client + `searchEmails` (list stubs) and `getEmail` (full body). All newsletter content enters the app through here.
