# Architecture

## Request flow

```
Browser
  │
  │  User clicks "Get today's briefing"
  │  sendMessage({ text: "What's in today's newsletter?" })
  ▼
app/page.tsx → Home()                          useChat() streams to /api/agent
  │
  │  POST /api/agent
  ▼
app/api/agent/route.ts → POST()                streamText() with claude-haiku, tools, systemPrompt
  │
  │  Claude reads lib/systemPrompt.ts and decides to call searchEmails
  ▼
lib/tools.ts → tools.searchEmails.execute()    Zod validates Claude's args, then calls Gmail
  │
  ▼
lib/gmail.ts → searchEmails()                  gmail.users.messages.list() → returns stubs (id only)
  │
  │  Claude receives stub list, calls getEmail for each
  ▼
lib/gmail.ts → getEmail()                      gmail.users.messages.get() → decodes MIME tree → plain text body
  │
  │  Claude reads all email bodies, synthesizes, writes ```json block
  │  { mood, components: [{ type, data }, ...] }
  │
  │  onFinish fires with completed text
  ▼
lib/parseResponse.ts → parseMood()             extracts mood field from JSON block
lib/parseResponse.ts → parseComponents()       Zod validates each component, sortByRisk(), drops malformed
lib/parseResponse.ts → parseProse()            captures any text before the JSON block (usually empty)
  │
  ├──▶ lib/usage.ts → recordUsage()            appends token + cost totals to usage.json
  │
  ├──▶ lib/digest.ts → saveDigest()            merges ticker mentions, writes digests/YYYY-MM-DD.json (L2)
  │
  └──▶ lib/cache.ts → setCached()              stores DigestRecord in module-level Map (L1)
  │
  │  Stream flows back to browser
  ▼
app/page.tsx → Home()                          agentText populated from firstAssistant message
  │
  ▼
components/ComponentRenderer.tsx → DigestRenderer()
  │
  ▼
components/ComponentRenderer.tsx → DigestLayout()     grids: tickers+sectors paired, earnings 3-col, rest full-width
  │
  ▼
components/ComponentRenderer.tsx → renderComponent()  switch on type → renders card component
  │
  ├──▶ components/ui/BriefingSummary.tsx
  ├──▶ components/ui/MacroSummaryCard.tsx
  ├──▶ components/ui/TickerMentionList.tsx
  ├──▶ components/ui/SectorHeatmap.tsx
  ├──▶ components/ui/EarningsHighlight.tsx
  ├──▶ components/ui/RiskFlag.tsx
  ├──▶ components/ui/NewsletterSummary.tsx
  └──▶ components/ui/DynamicChart.tsx
```

---

## Subsequent page loads (cache-first)

```
Browser
  │
  │  GET /api/digest
  ▼
app/api/digest/route.ts → GET()
  │
  ├──▶ lib/cache.ts → getCached()              L1: module-level Map — hit if same process, same day
  │       │ miss
  │       ▼
  └──▶ lib/digest.ts → getDigest()             L2: reads digests/YYYY-MM-DD.json from disk
          │ hit → returns rawText
          ▼
      app/page.tsx → setCachedContent()         briefingText populated, DigestRenderer renders immediately
```

---

## Ticker chart

```
Browser (on mount + after briefing completes)
  │
  │  GET /api/tickers
  ▼
app/api/tickers/route.ts → GET()               scans last 7 days of digest files via lib/digest.ts → listDigests()
  │                                            aggregates TickerMentionList entries by symbol
  ▼
app/page.tsx → setTickers()
  │
  ▼
components/ui/TickerMentionChart.tsx            Recharts bar chart of mention counts + direction
```

---

## Key contracts

| Boundary | What crosses it |
|----------|----------------|
| `lib/systemPrompt.ts` → Claude | Component menu + JSON schema Claude must emit |
| Claude → `lib/parseResponse.ts` | Raw text with ` ```json ``` ` block |
| `lib/parseResponse.ts` → `ComponentRenderer` | `DigestComponent[]` — Zod-validated, risk-sorted |
| `lib/tools.ts` → Claude | Tool results (email stubs, email bodies) as `tool_result` messages |
| `app/api/agent/route.ts` → browser | Vercel AI SDK UI message stream |

---

## Adding a new component (checklist)

1. Create `components/ui/MyCard.tsx`
2. Add Zod schema to `lib/parseResponse.ts` → `ComponentSchema` discriminated union
3. Add `case "MyCard"` to `renderComponent()` in `components/ComponentRenderer.tsx`
4. Describe it in `lib/systemPrompt.ts` — available components list + JSON example
