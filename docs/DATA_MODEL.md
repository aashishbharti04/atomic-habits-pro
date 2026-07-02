# Data Model — Supabase / PostgreSQL (draft)

All tables have Row Level Security: `user_id = auth.uid()` unless noted.

```sql
-- profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  timezone text default 'Asia/Kolkata',
  xp int not null default 0,
  level int not null default 1,
  created_at timestamptz default now()
);

-- habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  kind text not null default 'positive',        -- positive | negative (avoid)
  freq text not null default 'daily',           -- daily | weekdays | weekends | custom
  custom_days int[] default null,               -- 0-6, when freq = custom
  category text,
  priority text default 'medium',               -- low | medium | high | critical
  two_minute_version text,
  anchor text,                                  -- habit-stack cue
  archived_at timestamptz,
  created_at timestamptz default now()
);

-- one row per habit per day (done or skipped)
create table checkins (
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  day date not null,
  status text not null default 'done',          -- done | skip
  primary key (habit_id, day)
);
create index on checkins (user_id, day);

-- goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  horizon text default 'monthly',               -- daily..lifetime
  target_reps int not null,
  deadline date not null,
  created_at timestamptz default now()
);

create table goal_habits (
  goal_id uuid references goals(id) on delete cascade,
  habit_id uuid references habits(id) on delete cascade,
  primary key (goal_id, habit_id)
);

-- journal
create table journal_entries (
  user_id uuid not null references profiles(id) on delete cascade,
  day date not null,
  well text, improve text, win text, distraction text, priority text,
  mood smallint,                                -- 1-5, wellness module
  primary key (user_id, day)
);

-- scorecard / stacks / intentions / contract
create table scorecard_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  position int not null,
  text text not null,
  score text                                     -- '+' | '-' | '=' | null
);

create table stacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  after_text text not null,
  will_text text not null
);

create table intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  behavior text not null,
  at_time text not null,
  location text not null
);

create table contracts (
  user_id uuid primary key references profiles(id) on delete cascade,
  promise text, penalty text, partner text, signed_by text, signed_on date
);

-- gamification
create table achievements (
  user_id uuid not null references profiles(id) on delete cascade,
  key text not null,                             -- streak_7, streak_30, ...
  earned_at timestamptz default now(),
  habit_id uuid references habits(id) on delete set null,
  primary key (user_id, key)
);

-- AI coach artifacts (phase 4)
create table coach_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  content jsonb not null,                        -- structured report from Claude
  created_at timestamptz default now(),
  unique (user_id, week_start)
);

-- community (phase 5)
create table partnerships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references profiles(id) on delete cascade,
  partner uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending',        -- pending | active | ended
  created_at timestamptz default now()
);
```

## Derived (never stored)

Current streak, best streak, habit strength, completion rates, heatmap levels, goal pace/probability — always computed from `checkins` (same formulas as v1 `app.js`).

## v1 import mapping

| v1 JSON | Pro table |
|---|---|
| `habits[]` | `habits` |
| `checks{habitId}{date}: true/"skip"` | `checkins` (`done`/`skip`) |
| `goals[]` | `goals` + `goal_habits` |
| `journal{date}` | `journal_entries` |
| `scorecard[]`, `stacks[]`, `intentions[]`, `contract` | respective tables |
