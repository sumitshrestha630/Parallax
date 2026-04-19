# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Lint & test
npm run lint         # ESLint
npm run test         # Run tests once (vitest)
npm run test:watch   # Watch mode
```

Tests live in `src/test/`. Run a single test file: `npx vitest run src/test/SomeFile.test.tsx`.

Supabase Edge Functions are Deno-based and live in `supabase/functions/`. They are not bundled by Vite and are deployed separately via the Supabase CLI.

## Architecture

This is a **React 18 + TypeScript + Vite** SPA — "RetroNet", a student outreach tool that lets college students find industry professionals and AI-draft personalized cold messages.

### Routing (`src/App.tsx`)
React Router v6. All routes except `/` and `/auth` are wrapped in `<RequireAuth>`, which redirects unauthenticated users.

| Route | Page |
|-------|------|
| `/` | Landing / Index |
| `/auth` | Supabase Auth UI |
| `/dashboard` | Stats + recent messages |
| `/search` | Search professionals, open draft dialog |
| `/messages` | Outbox — manage draft/sent/replied state |
| `/profile` | Edit student profile |

### Data layer
**Supabase** (`src/integrations/supabase/client.ts`) for auth and Postgres. All queries go through **TanStack Query** (`@tanstack/react-query`) — query keys are `["messages"]`, `["pros", query]`, `["stats"]`.

Three tables (types in `src/integrations/supabase/types.ts`):
- `professionals` — searchable directory of pros (name, role, company, field, bio, linkedin_url, avatar_seed)
- `profiles` — student profile linked to `auth.users` (college, major, grad_year)
- `messages` — outreach messages with status enum: `draft | sent | replied`

Auth state is managed by `useAuth()` / `useProfile()` in `src/hooks/useAuth.ts` — these wrap Supabase's `onAuthStateChange` and return `{ session, user, loading }`.

### AI message generation
`supabase/functions/generate-outreach/index.ts` — Deno Edge Function that calls the **Lovable AI Gateway** (`ai.gateway.lovable.dev`) using `google/gemini-3-flash-preview` with tool-calling to return `{ subject, body }`. Requires `LOVABLE_API_KEY` env var in Supabase secrets. Called client-side via `supabase.functions.invoke("generate-outreach", { body: ... })` from `MessageDraftDialog`.

### Design system
Pixel/arcade aesthetic ("RetroNet"). CSS custom properties defined in `src/index.css`. Key utility classes applied via Tailwind:
- `font-pixel` — Press Start 2P (headings)
- `font-mono` — Space Mono (body text)
- `pixel-card` — card with 2px hard border + pixel drop shadow
- `pixel-tag` — inline status badge
- `shadow-pixel`, `shadow-pixel-sm`, `shadow-pixel-lg` — offset box shadows

The `PixelAvatar` component (`src/components/PixelAvatar.tsx`) generates deterministic pixel art from a professional's `avatar_seed`.

### Key shared types
`src/lib/types.ts` exports `Professional`, `Message`, and `MessageStatus`. `src/lib/professionals.ts` contains `searchProfessionals()` which queries Supabase with optional role/company/field filters.
