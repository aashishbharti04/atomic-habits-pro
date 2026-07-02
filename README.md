# Atomic Habits Pro

> Not just a habit tracker. A complete personal growth operating system.

An AI-powered habit platform combining **Atomic Habits principles, behavioral psychology, predictive analytics, and gamification** — the next-generation rebuild of the [Atomic Habits Dashboard v1](https://github.com/aashishbharti04/atomic-habits-dashboard) ([live demo](https://aashishbharti04.github.io/atomic-habits-dashboard/)).

## Status

🚧 **Early development.** The v1 static dashboard is live and fully functional (habits, streaks, calendar, insights, coach, goals, XP, journal, PWA). This repo is the platform rebuild that adds what a static site can't do: accounts, cross-device sync, real AI coaching, notifications, and community.

## Documents

- [VISION.md](VISION.md) — full product vision and the 20 core modules
- [ROADMAP.md](ROADMAP.md) — phased delivery plan (what ships when)
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — Supabase/PostgreSQL schema draft

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) · React · TypeScript · Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| AI | Anthropic Claude API (coaching, weekly reports) |
| Charts | Recharts |
| Hosting | Vercel (web) · Supabase (data) |
| Auth | Google · GitHub · Email magic links |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (once Supabase is connected)

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-key   # server-side only, for AI coach
```

## Relationship to v1

The v1 dashboard remains live and free at [aashishbharti04.github.io/atomic-habits-dashboard](https://aashishbharti04.github.io/atomic-habits-dashboard/). Its JSON export is the planned import format for Pro, so no tracking history is lost when migrating.
