This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Architecture Decisions

### 1. Human-in-the-loop chat with generative UI cards

The initial design paired a follow-up chat interface with a model that selects and arranges UI components dynamically. Rather than returning markdown, the agent emits a structured JSON block describing which cards to render (`MacroSummaryCard`, `TickerMentionList`, `SectorHeatmap`, `EarningsHighlight`, `RiskFlag`, `NewsletterSummary`) alongside a `mood` signal that shifts the page's color scheme. `ComponentRenderer` parses this block client-side and maps each spec to its React component. This keeps the model in control of layout and framing while the frontend stays declarative — adding a new component type only requires registering it in the switch and describing it in the system prompt.

### 2. Proactive digest with local persistence

The chat-first model was replaced with a proactive one: the primary surface is a full-page digest triggered by a single button rather than a user prompt. On completion the agent response is parsed and written to `digests/YYYY-MM-DD.json` via `lib/digest.ts`, capturing mood, prose, components, raw text, and token usage. This serves two purposes — it creates a historical record that can later be fed back into context ("inflation narrative has shifted over the last three newsletters"), and it separates the expensive Gmail + inference operation from the rendering concern. The file is the source of truth; everything else reads from it.

### 3. Two-layer cache to reduce Gmail fetches and inference

A module-level `Map` in `lib/cache.ts` sits in front of the file system. On page load, `GET /api/digest` checks L1 (memory) then L2 (file) before ever touching Gmail or the model. A hit at either layer returns the stored `rawText` directly to the frontend, which renders it through `DigestRenderer` with no additional work. The cache is keyed by date and auto-evicts any entry that isn't today, so there is no explicit TTL logic to maintain. The agent only runs when neither layer has today's digest — meaning a typical day costs exactly one Gmail fetch and one inference call regardless of how many times the page is loaded.
