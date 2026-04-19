# Rooted — Build Your Future

A gamified skill-building platform for college students. Learn real-world tech skills through interactive skill trees, curated tasks, and a career-focused dashboard.

---

## Overview

Rooted turns career skill development into a game. Students pick a career path (Software Engineer, Data Scientist, or UX Designer), unlock skill nodes on a visual tree, complete curated practice tasks, and track their XP and level across a personalized dashboard.

Key features:
- **Skill Tree** — visual node-based learning path per career track with prerequisites, XP rewards, and badge unlocks
- **Tasks** — curated step-by-step practice tasks with checklist instructions tied to each skill node
- **CPU Architecture Map** — gamified dashboard showing skill lanes (Frontend, Backend, AI/ML, etc.) with live XP from Supabase
- **Balance View** — weekly schedule planner with insights and study recommendations
- **Pixel Avatar** — customizable avatar chosen during onboarding, animated on the dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + inline pixel-art styles |
| Auth & DB | Supabase (SSR auth, PostgreSQL, RLS) |
| Animation | Framer Motion |
| Font | Press Start 2P (Google Fonts) |

---

## Setup

**Prerequisites:** Node.js 18+, a Supabase project

1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd Parallax
   npm install
   ```

2. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the Supabase migrations in order:
   ```
   supabase/migrations/001_dashboard_schema.sql
   ```
   Apply these via the Supabase SQL editor or CLI (`supabase db push`).

4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint via next lint
```

---

## Architecture

### Auth Flow

```
Sign up / Log in → OAuth callback → Onboarding (school, level, goal, avatar)
                                          ↓
                                    /dashboard
```

- `middleware.ts` refreshes Supabase session cookies on every request
- `app/auth/callback/route.ts` exchanges the OAuth code and routes: incomplete onboarding → `/onboarding`, complete → `/dashboard`
- All user state from onboarding (school, goal, avatar) is stored in `user.user_metadata` — no separate profiles table

### Data Flow

```
DashboardShell (Server Component)
  └─ fetches all Supabase data (skills, tasks, state, items)
       └─ passes to Dashboard (Client Component)
            ├─ SkillTree      — career path nodes + XP + badges
            ├─ CpuArchitecture — skill lane map with live XP
            ├─ TaskPage       — learning tasks with step-by-step guides
            └─ BalanceView    — weekly schedule + study insights
```

### Supabase Schema (key tables)

| Table | Purpose |
|---|---|
| `user_skills` | Per-user XP and level per skill lane |
| `user_tasks` | Per-user task status and completion |
| `user_dashboard_state` | Active avatar, career path, metadata |
| `user_dashboard_items` | Which widgets are visible on the dashboard |
| `skills` / `tasks` | Global catalogs (read-only for users) |

Row Level Security is enabled on all user tables — users can only read and write their own rows.

### XP & Leveling

- **200 XP per level**, consistent across the skill tree, CPU map, and nav bar
- Completing a task awards XP to the linked `user_skills` row and increments level if the threshold is crossed
- Skill tree node completion is persisted to `user_dashboard_state.metadata` as JSON

---

## Project Structure

```
app/
  dashboard/        # Main dashboard page (server component shell)
  tasks/            # Task list and node-specific task pages
  onboarding/       # 4-step onboarding flow
  auth/callback/    # Supabase OAuth callback

components/
  ui/               # Core UI: dashboard, skill-tree, cpu-architecture, pixel-avatar
  dashboard/        # Task pages, renderers, shell, balance view wrappers
  balance/          # Weekly schedule components

lib/
  supabase/         # Server + client Supabase factories, query helpers
  dashboard/        # Service functions, component registry, career data
  tasks/            # Curated suggested tasks per skill node
  skill-tree-data.ts # Career tracks, nodes, edges, badges

types/
  dashboard.ts      # Shared TypeScript interfaces
  suggested-task.ts # Curated task type
```
