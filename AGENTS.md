# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Environment

Requires `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture Overview

**Parallax (Rooted)** is a gamified skill-building platform for college students. Built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase SSR auth, and Framer Motion.

### Auth Flow

1. **`middleware.ts`**: Refreshes session cookies on every request; signs out if refresh token is missing.
2. **`app/auth/callback/route.ts`**: OAuth callback — exchanges code for session, then routes based on `user.user_metadata.onboarding_complete`: `false` → `/onboarding`, `true` → `/dashboard`.
3. **`lib/supabase/server.ts`**: Async server-side Supabase client factory (use in Server Components and API routes).
4. **`lib/supabase/client.ts`**: Sync browser Supabase client factory (use in Client Components).

All auth-guarded pages use `export const dynamic = "force-dynamic"` to prevent stale caching.

### Onboarding

`components/ui/onboarding.tsx` — 4-step flow (school → education level → career goal → avatar). Saves everything via `supabase.auth.updateUser({ data: { school, education_level, goal, goal_label, avatar_type, onboarding_complete: true } })`. No separate profiles table — all user onboarding state lives in `user.user_metadata`.

### Server → Client Data Handoff

Server Components fetch data and pass it to Client Components. Because Supabase's `User` type is not JSON-serializable, **always pass it through `lib/dashboard/client-serialization.ts`** before handing to client. `DashboardShell.tsx` is the canonical example of this pattern.

### Dashboard Structure

The main hub is `components/ui/dashboard.tsx` (client), rendered via `components/dashboard/DashboardShell.tsx` (server). Four tabs:

| Tab | Key File |
|-----|----------|
| Dashboard | `components/ui/dashboard.tsx` (pixel forest canvas + recommended tasks) |
| Skill Tree | `components/ui/skill-tree.tsx` |
| Tasks | `components/dashboard/TaskPage.tsx` |
| Balance | `components/balance/BalanceView.tsx` |

### Skill Tree

Defined in `lib/skill-tree-data.ts`. Three career tracks: **Software Engineer (SE)**, **Data Scientist (DA)**, **UX Designer (UX)**. Each track has `SkillNode[]` with prereqs, resources, challenges, and difficulty tier. SVG bezier edges share coordinate system with HTML node cards via `viewBox="0 0 100 100"` + CSS `left/top` percentages. `completeNode()` does a two-pass unlock: mark node done, then re-check which locked nodes now have all prereqs met.

Node states (`"completed" | "active" | "locked"`) are currently mock defaults — **not persisted to Supabase yet**.

### XP & Leveling

- **200 XP per level**, used consistently in dashboard, skill tree, and CPU map.
- Completing a task: awards `xp_earned` to the linked `user_skills` row and increments `level` if threshold crossed.
- Live XP sync across components uses `DashboardSkillsSyncProvider` context (`components/dashboard/dashboard-skills-sync.tsx`).

### API Routes

- **`/api/tasks`** (GET/POST): Task CRUD + completion (awards XP). GET supports `mode`, `status`, `skillKey`, `difficulty`, `includeResources` query params.
- **`/api/schedule`** (GET/POST/PATCH/DELETE): Schedule event CRUD; all require auth.

### Balance (Weekly Schedule)

Logic lives in `lib/balance/`. `calendar-layout.ts` computes the grid; `insights.ts` identifies heavy/free days; `recommendations.ts` suggests free slots; `weekly-plan.ts` calculates suggested lesson/practice/project hours. Rendered in `components/balance/`.

### Design System

- **Backgrounds**: `#080e1a` (app), `#060c18` (panel), `#0d1a2e` (card/input)
- **Primary accent**: `#6ED640` / `#78E04A` (green); borders `#1a2744` / `#1e3858`
- **Difficulty colors**: BEGINNER `#6ED640`, INTERMEDIATE `#FBBF24`, ADVANCED `#F472B6`
- **Font**: `'Press Start 2P', monospace` — loaded per-page from Google Fonts (should be moved to `app/layout.tsx`)
- **Button**: Use the `PIXEL_BTN_STYLE` constant defined within each component for consistency
- **Tailwind v4**: No `tailwind.config.js`; uses PostCSS v4 defaults. Use utility classes for layout/spacing; inline styles for all pixel-art/game-UI styling.
- **Path alias**: `@/*` maps to `./*` (root)

### Canvas Animations

Three canvas-based renderers using `requestAnimationFrame`:
- **Dashboard forest** (`dashboard.tsx`): 480×300 internal resolution, CSS-scaled with `image-rendering: pixelated`
- **Pixel avatar** (`components/ui/pixel-avatar.tsx`): 32×40 canvas, 6 avatar types (`coder`, `explorer`, `wizard`, `knight`, `artist`, `scientist`), blink/mouth animation
- **Night sky** (login/signup pages): 1200×700, twinkling stars + clouds

### Supabase Schema

Key tables (see `supabase/migrations/` for full DDL):
- `user_skills` — per-user skill XP, level, unlocked flag, SVG path metadata
- `user_tasks` — per-user task progress (`locked | available | in_progress | completed`)
- `skills` / `tasks` — global catalogs (read-all for authenticated users)
- `user_schedule_events` — weekly schedule blocks
- `user_dashboard_state` — theme, avatar, selected career path

RLS: all user tables are own-row only; `skills`/`tasks` are read-all for authenticated users.

### Known Gaps

- Skill Tree node states not persisted to Supabase; currently computed from mock defaults.
- `Press Start 2P` font loaded per-page — should be moved to `app/layout.tsx`.
- `three` (Three.js) is installed but unused.
- `courses` and `task_resources` tables exist (migrations 005–006) but may not be fully wired to the UI.
