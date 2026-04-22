# Routes & Architecture

## Dependencies & Versions
All package versions and dependency trees: [package-lock.json](./package-lock.json)

## System Prompt
[lib/systemPrompt.ts](./lib/systemPrompt.ts)

## Project Structure
- **`lib/`** — pure TypeScript modules: business logic, utilities, and data access (no HTTP, no React). Importable from anywhere.
- **`app/`** — Next.js App Router: React pages, layouts, and API route handlers (`app/api/*/route.ts`). Everything here is tied to the request/response lifecycle.
