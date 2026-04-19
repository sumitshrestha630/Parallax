# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Next.js, port 3000)
npm run build      # Production build
npm run lint       # ESLint via next lint
```

No test suite is configured. There is no `test` script.

## Environment

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

**"Rooted"** — a gamified skill-building platform for college students. Next.js 15 App Router with Supabase SSR auth.

### Auth flow
1. OAuth (Google) → `app/auth/callback/route.ts` exchanges code for session
2. Callback checks `user.user_metadata.onboarding_complete`:
   - `false` / missing → `/onboarding`
   - `true` → `/dashboard`
3. All page-level auth guards live in **server components** (`app/*/page.tsx`) using `lib/supabase/server.ts`
4. Client-side Supabase mutations (sign out, updateUser) use `lib/supabase/client.ts`

### Onboarding
`components/ui/onboarding.tsx` — 4-step flow (school → education level → career goal → avatar). Saves everything to `supabase.auth.updateUser({ data: { school, education_level, goal, goal_label, avatar_type, onboarding_complete: true } })`. No separate DB table — all user state lives in `user.user_metadata`.

### Dashboard
`components/ui/dashboard.tsx` — single large client component. Tab system: `["Dashboard", "Skill Tree", "Tasks", "Balance"]`. Rendering is conditional on `navTab`:
- **Skill Tree tab** → renders `<SkillTree user={user} />`
- **All other tabs** → renders pixel-art canvas forest + recommended tasks panel

The canvas forest (`drawForest`) runs a `requestAnimationFrame` loop at `CW=480 × CH=300` internal resolution, scaled up via CSS with `image-rendering: pixelated`.

### Skill Tree
- **Data**: `lib/skill-tree-data.ts` — types + three `CareerTrack` objects (SE, DA, UX), each with `SkillNode[]`, edges `[string, string][]`, and `Badge[]`. Node states are mock defaults; no Supabase wiring yet.
- **Component**: `components/ui/skill-tree.tsx` — renders the interactive tree. SVG bezier edges share coordinate system with HTML node cards via `viewBox="0 0 100 100"` + `preserveAspectRatio="none"` matching CSS `left/top` percentages. `completeNode()` does a two-pass unlock: mark node done, then re-check which locked nodes now have all prereqs met.

### Avatar system
`components/ui/pixel-avatar.tsx` — shared across onboarding and dashboard. `drawAvatar(ctx, def, t)` draws a 32×40 pixel-art bust with RAF-animated blinking/mouth/accessories. `PixelAvatar` component wraps it in a canvas with `image-rendering: pixelated`. Six types: `coder`, `explorer`, `wizard`, `knight`, `artist`, `scientist`.

### Design tokens
Consistent across all components (no shared CSS variables — inline styles):
- Font: `'Press Start 2P', monospace` (loaded dynamically via Google Fonts in onboarding; should be added to layout for others)
- Backgrounds: `#080e1a` (app), `#060c18` (panels), `#0d1a2e` (inputs/cards)
- Accent: `#6ED640` / `#78E04A` green; borders `#1a2744` / `#1e3858`
- Pixel button helper: `PIXEL_BTN_STYLE(bg, border, shadow)` defined locally in each component

### Tailwind
v4 with `@tailwindcss/postcss`. Config is in `postcss.config.mjs` — no `tailwind.config.js`. Use utility classes for layout/spacing; use inline styles for all pixel-art/game-UI styling.
