# Todo

## Vercel / Production

- **Replace filesystem cache with Vercel KV** — `/tmp` is ephemeral per-invocation on Vercel, so L1 (module Map) and L2 (digest files) don't survive across requests. Replace `lib/digest.ts` and `lib/cache.ts` reads/writes with `kv.get`/`kv.set` from `@vercel/kv`. This also fixes the ticker bar chart showing no data (it reads from digest files).

- **Replace `isRunning` guard with KV-backed mutex** — the module-level `isRunning` flag in `app/api/agent/route.ts` is reset on every Vercel invocation (separate processes), so the concurrent request guard does nothing in production. Replace with a `briefing:running` key in Vercel KV with a TTL so the lock works across invocations.

- **Usage tracking is broken in production** — `usage.json` is written to `/tmp` on Vercel, which is wiped per-invocation. Every request starts from zero spend. Fix: store usage in Vercel KV with `kv.incrby` for atomic increments (also fixes the read-modify-write race where two concurrent requests can silently overwrite each other's counts).

- **Add retry logic for Gmail and Claude API calls** — transient timeouts are more common in production. Neither `lib/gmail.ts` nor `app/api/agent/route.ts` has any retry or backoff, so one flaky network call surfaces as a hard failure to the user.
