# Roadmap — Easiest to Hardest

---

## Phase 2 — Proactive & Context-Aware

### 1. Page mood signal *(easy)*
Model emits a `mood` field (`normal | alert | opportunity | danger`) alongside the component JSON. App applies a matching color scheme / background shift. No new components needed — just one extra field parsed in `ComponentRenderer` and a CSS class swap on the root.

### 2. Proactive auto-fetch on load *(easy)*
Remove the need to type a prompt. On page load, the app automatically fires "What's in today's newsletter?" if no messages exist. Chat stays available for follow-up questions.

### 3. Chat demoted to floating icon *(easy — frontend only)*
Move the input bar to a small floating chat button (bottom right). Proactive digest view becomes the primary surface. Cursor task.

### 4. Watchlist with entry prices *(medium)*
Store a hardcoded list of tickers + entry prices in `lib/watchlist.ts`. Pass them into the system prompt so the model can cross-reference ("you're up 23% on NVDA — this news is a potential exit signal"). Entry prices make the model's framing personal rather than generic.

### 5. Layout decisions by model *(medium)*
Add a `layout` field to the component JSON spec (`normal | alert-top | split-panel`). `ComponentRenderer` reads it and changes how components are arranged — e.g., `alert-top` pins a RiskFlag full-width above everything else, `split-panel` puts watchlist context left and news right.

---

## Phase 3 — Dynamic & Generative

### 6. Mood-driven theming *(medium — frontend heavy)*
Beyond a color class swap, full theme shifts per mood — typography weight, spacing, card border colors, background gradients. Fed talk day should *feel* different from a calm market day at a glance. Cursor task for the visual design, backend just needs to emit the mood reliably.

### 7. Multi-newsletter aggregation *(medium)*
Instead of picking one email, fetch the latest from each approved sender and synthesize across all of them. Requires the model to reconcile conflicting signals (e.g., Bloomberg bullish, Seeking Alpha bearish on the same stock).

### 8. In-memory cache for digests *(medium)*
Add a server-side in-memory cache (e.g., a module-level `Map`) so repeated requests within the same process don't re-fetch Gmail or re-run the agent. Cache keyed by date; invalidated after a configurable TTL (e.g., 1 hour). Good first foray into server-side caching before touching Redis or edge KV stores.

### 9. Historical context *(hard)*
Store past digest summaries in a local JSON file. Pass the last N digests into context so the model can say "inflation narrative has shifted hawkish over the last 3 newsletters" rather than treating each day in isolation.

### 10. New component generation *(hard)*
For edge cases the fixed component set can't handle, the model describes a new component (structure + data). The app either maps it to the closest existing component or — ambitiously — generates JSX at runtime. Requires a validation layer so malformed output doesn't crash the UI.

### 11. Portfolio integration *(hard)*
Connect to a brokerage API (Alpaca, Robinhood via unofficial API, or manual position file). Model contextualizes every news item against actual holdings — not just watchlist tickers but real position sizes and P&L. Changes "consider exiting" into "you have $4,200 at risk here."
