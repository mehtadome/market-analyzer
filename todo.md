# Todo

## Vercel / Production

- **Replace `isRunning` guard with Redis mutex** — the module-level `isRunning` flag in `app/api/agent/route.ts` resets on every Vercel invocation (separate processes), so the concurrent request guard does nothing in production. Replace with a `briefing:running` key in Redis using `SET NX EX` so the lock works across invocations.

- **Settings navigation clears digest** — navigating to `/settings` and back remounts the page, resetting all React state. The return `/api/digest` call then hits Redis (now fixed), so this should be resolved — verify in prod.

- **Rename project to chews-meridian** — rename Vercel project in dashboard (Settings → General → Project Name), update `package.json` name field, and archive the chews-meridian repo. Wait until Vercel interviewers confirm they no longer need the current URL.

- **Add retry logic for Gmail and Claude API calls** — transient timeouts are more common in production. Neither `lib/gmail.ts` nor `app/api/agent/route.ts` has any retry or backoff, so one flaky network call surfaces as a hard failure to the user.

- **Rename project to chews-meridian** — rename Vercel project in dashboard (Settings → General → Project Name), update `package.json` name field, and archive the chews-meridian repo. Wait until Vercel interviewers confirm they no longer need the current URL.

## At Scale

- **`KEYS` in `listDigests` is a blocking scan** — `redis.keys("digest:*")` in `lib/digest.ts` blocks the Redis server while scanning. Fine for a personal tool with <100 keys, but at scale replace with `SCAN` which iterates in batches without blocking.

- **Redis key namespacing across deployments** — all Vercel deployments (production, preview branches) share the same Redis instance and key namespace. At scale or with multiple environments, prefix keys by environment (e.g. `prod:digest:2026-04-22` vs `preview:digest:2026-04-22`) to avoid cross-deployment data bleed.
