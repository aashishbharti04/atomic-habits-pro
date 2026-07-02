import type { AppState, CoachCard, Freq, Goal, Habit } from "./types";

/* ==================== dates ==================== */
export function dateKey(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
export function todayKey(): string {
  return dateKey(new Date());
}
export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export const FREQ_LABEL: Record<Freq, string> = {
  daily: "every day",
  weekdays: "weekdays",
  weekends: "weekends",
};

export const MILESTONES = [
  { days: 7, emoji: "🥉", label: "One Week", sub: "7-day streak" },
  { days: 21, emoji: "🥈", label: "Three Weeks", sub: "21-day streak" },
  { days: 30, emoji: "🥇", label: "One Month", sub: "30-day streak" },
  { days: 66, emoji: "💎", label: "Habit Formed", sub: "66-day streak — the average time to automaticity" },
  { days: 100, emoji: "🏆", label: "Centurion", sub: "100-day streak" },
] as const;

/* ==================== scheduling & checks ==================== */
export function isScheduled(h: Habit, d: Date): boolean {
  const day = d.getDay();
  if (h.freq === "weekdays") return day >= 1 && day <= 5;
  if (h.freq === "weekends") return day === 0 || day === 6;
  return true;
}
export function isChecked(s: AppState, habitId: string, key: string): boolean {
  return s.checks[habitId]?.[key] === true;
}
export function isSkipped(s: AppState, habitId: string, key: string): boolean {
  return s.checks[habitId]?.[key] === "skip";
}
export function checksCount(s: AppState, h: Habit): number {
  return Object.values(s.checks[h.id] ?? {}).filter((v) => v === true).length;
}
/* a day "counts" when scheduled, not skipped, and the habit existed */
export function countsOn(s: AppState, h: Habit, d: Date, key?: string): boolean {
  const k = key ?? dateKey(d);
  if (h.created && k < h.created) return false;
  return isScheduled(h, d) && !isSkipped(s, h.id, k);
}
export function habitAge(h: Habit): number {
  if (!h.created) return 999;
  return Math.round((new Date(todayKey()).getTime() - new Date(h.created).getTime()) / 86400000);
}

/* ==================== streaks & strength ==================== */
export function currentStreak(s: AppState, h: Habit): number {
  let streak = 0;
  const d = new Date();
  if (countsOn(s, h, d) && !isChecked(s, h.id, dateKey(d))) d.setDate(d.getDate() - 1);
  for (let guard = 0; guard < 3700; guard++) {
    if (!countsOn(s, h, d)) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (!isChecked(s, h.id, dateKey(d))) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
export function bestStreak(s: AppState, h: Habit): number {
  const keys = Object.keys(s.checks[h.id] ?? {});
  if (!keys.length) return 0;
  const start = new Date(keys.sort()[0] + "T00:00:00");
  const end = new Date();
  const tk = todayKey();
  let best = 0,
    run = 0;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (!countsOn(s, h, d)) continue;
    if (isChecked(s, h.id, dateKey(d))) {
      run++;
      if (run > best) best = run;
    } else if (dateKey(d) !== tk) run = 0;
  }
  return best;
}
/* Loop-style strength: exponentially weighted completion over the last 60 days */
export function habitStrength(s: AppState, h: Habit): number {
  let num = 0,
    den = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    if (countsOn(s, h, d)) {
      const w = Math.pow(0.94, i);
      den += w;
      if (isChecked(s, h.id, dateKey(d))) num += w;
    }
    d.setDate(d.getDate() - 1);
  }
  return den ? Math.round((num / den) * 100) : 0;
}

/* completion over a back-window of days: [from, to) offsets from today */
export function rateOver(s: AppState, habits: Habit[], from: number, to: number) {
  let poss = 0,
    done = 0;
  const d = new Date();
  d.setDate(d.getDate() - from);
  for (let i = from; i < to; i++) {
    const k = dateKey(d);
    for (const h of habits) {
      if (!countsOn(s, h, d, k)) continue;
      poss++;
      if (isChecked(s, h.id, k)) done++;
    }
    d.setDate(d.getDate() - 1);
  }
  return { poss, done, rate: poss ? done / poss : null };
}

/* ==================== XP & levels ==================== */
export const LEVEL_TITLES = [
  "Beginner", "Starter", "Builder", "Consistent", "Committed",
  "Disciplined", "Focused", "Relentless", "Unstoppable", "Atomic",
];
export function xpTotal(s: AppState): number {
  let reps = 0;
  for (const h of s.habits) reps += checksCount(s, h);
  const maxBest = s.habits.reduce((m, h) => Math.max(m, bestStreak(s, h)), 0);
  const badges = MILESTONES.filter((m) => maxBest >= m.days).length;
  return reps * 10 + badges * 100;
}
export function levelInfo(xp: number) {
  let lvl = 1,
    need = 100,
    rem = xp;
  while (rem >= need && lvl < 99) {
    rem -= need;
    lvl++;
    need = Math.round(need * 1.2);
  }
  const title = LEVEL_TITLES[Math.min(Math.floor((lvl - 1) / 2), LEVEL_TITLES.length - 1)];
  return { lvl, rem, need, title };
}

/* ==================== goals ==================== */
export function goalProgress(s: AppState, g: Goal): number {
  let reps = 0;
  for (const hid of g.habitIds) {
    const m = s.checks[hid] ?? {};
    for (const [k, v] of Object.entries(m)) {
      if (v === true && k >= g.created && k <= g.deadline) reps++;
    }
  }
  return reps;
}
export function goalStatus(s: AppState, g: Goal) {
  const tk = todayKey();
  const reps = goalProgress(s, g);
  const pct = Math.min(100, Math.round((reps / g.targetReps) * 100));
  const total = Math.max(1, Math.round((new Date(g.deadline).getTime() - new Date(g.created).getTime()) / 86400000) + 1);
  const gone = Math.min(total, Math.max(0, Math.round((new Date(tk).getTime() - new Date(g.created).getTime()) / 86400000) + 1));
  const daysLeft = Math.max(0, Math.round((new Date(g.deadline).getTime() - new Date(tk).getTime()) / 86400000));
  const expected = g.targetReps * (gone / total);
  let status: string, cls: "done" | "over" | "ok" | "risk";
  if (reps >= g.targetReps) { status = "🎉 Achieved"; cls = "done"; }
  else if (daysLeft === 0 && tk > g.deadline) { status = "Deadline passed"; cls = "over"; }
  else if (gone <= 2) { status = "Just started"; cls = "ok"; }
  else if (reps >= expected * 0.9) { status = "On track"; cls = "ok"; }
  else { status = "At risk — raise the pace"; cls = "risk"; }
  return { reps, pct, daysLeft, status, cls };
}

/* ==================== coach ==================== */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function coachInsights(s: AppState): CoachCard[] {
  const cards: CoachCard[] = [];
  const add = (tone: CoachCard["tone"], icon: string, title: string, body: string) =>
    cards.push({ tone, icon, title, body });

  if (!s.habits.length) {
    add("info", "👋", "Welcome, let's begin",
      "Add your first habit on the Today page — start with something that takes two minutes or less. I'll start generating insights from your data after a few days of tracking.");
    return cards;
  }

  /* weekly summary + burnout */
  const w1 = rateOver(s, s.habits, 0, 7);
  const w2 = rateOver(s, s.habits, 7, 14);
  if (w1.poss >= 3) {
    let msg = `You completed ${w1.done} of ${w1.poss} scheduled habits this week (${Math.round((w1.rate ?? 0) * 100)}%).`;
    if (w2.rate !== null && w2.poss >= 3) {
      const diff = Math.round(((w1.rate ?? 0) - w2.rate) * 100);
      msg += diff >= 0
        ? ` That's ${diff}% better than last week — momentum is real.`
        : ` That's ${-diff}% below last week.`;
    }
    add((w1.rate ?? 0) >= 0.7 ? "good" : "info", "📈", "This week", msg);
    if (w2.rate !== null && w2.rate >= 0.5 && (w1.rate ?? 0) < w2.rate - 0.25 && w2.poss >= 5) {
      add("risk", "🪫", "Possible burnout signal",
        `Your completion dropped from ${Math.round(w2.rate * 100)}% to ${Math.round((w1.rate ?? 0) * 100)}% week-over-week. Don't quit — shrink. Scale every habit down to its two-minute version this week and rebuild the rhythm before raising the bar.`);
    }
  }

  /* streaks at risk today */
  const now = new Date();
  const tk = todayKey();
  for (const h of s.habits) {
    if (!countsOn(s, h, now, tk) || isChecked(s, h.id, tk)) continue;
    const st = currentStreak(s, h);
    if (st >= 3)
      add("warn", "🔥", "Streak at risk",
        `"${h.name}" has a ${st}-day streak and isn't done yet today. The two-minute version still counts — never miss twice.`);
  }

  /* weekday vs weekend pattern (daily habits, last 8 weeks) */
  for (const h of s.habits) {
    if (h.freq !== "daily") continue;
    let wePoss = 0, weDone = 0, wdPoss = 0, wdDone = 0;
    const d = new Date();
    for (let i = 0; i < 56; i++) {
      const k = dateKey(d);
      if (countsOn(s, h, d, k)) {
        const wknd = d.getDay() === 0 || d.getDay() === 6;
        if (wknd) { wePoss++; if (isChecked(s, h.id, k)) weDone++; }
        else { wdPoss++; if (isChecked(s, h.id, k)) wdDone++; }
      }
      d.setDate(d.getDate() - 1);
    }
    if (wePoss >= 4 && wdPoss >= 10) {
      const weR = weDone / wePoss, wdR = wdDone / wdPoss;
      if (weR - wdR >= 0.2)
        add("info", "📊", "Pattern detected",
          `Your "${h.name}" completion rate is ${Math.round((weR - wdR) * 100)}% higher on weekends. Consider a bigger weekend version of this habit — and a smaller, easier weekday version so busy days don't break the chain.`);
      else if (wdR - weR >= 0.2)
        add("info", "📊", "Pattern detected",
          `"${h.name}" drops ${Math.round((wdR - weR) * 100)}% on weekends. Weekends lack your weekday cues — pick a specific weekend time and place for it (implementation intention).`);
    }
  }

  /* high-risk day (last 12 weeks) */
  const byDay = Array.from({ length: 7 }, () => ({ poss: 0, done: 0 }));
  const hd = new Date();
  for (let i = 0; i < 84; i++) {
    const k = dateKey(hd);
    for (const h of s.habits) {
      if (!countsOn(s, h, hd, k)) continue;
      byDay[hd.getDay()].poss++;
      if (isChecked(s, h.id, k)) byDay[hd.getDay()].done++;
    }
    hd.setDate(hd.getDate() - 1);
  }
  let worst = -1, worstRate = 1;
  byDay.forEach((v, i) => {
    if (v.poss >= 8) {
      const r = v.done / v.poss;
      if (r < worstRate) { worstRate = r; worst = i; }
    }
  });
  if (worst >= 0 && worstRate < 0.6) {
    add("warn", "⚠️", "High-risk day",
      `${DAY_NAMES[worst]} is your weakest day — only ${Math.round(worstRate * 100)}% completion over the last 12 weeks. Prepare the night before: lay out your cues, and commit to two-minute versions on ${DAY_NAMES[worst]}s.`);
  }

  /* strength leader & laggard — only judge habits at least a week old */
  const mature = s.habits.filter((h) => habitAge(h) >= 7);
  if (mature.length >= 2) {
    const ranked = mature.map((h) => ({ h, s: habitStrength(s, h) })).sort((a, b) => b.s - a.s);
    const top = ranked[0], low = ranked[ranked.length - 1];
    if (top.s >= 70)
      add("good", "🏆", "Your keystone habit",
        `"${top.h.name}" is your strongest habit (${top.s}% strength). Use it as an anchor: stack your next new habit right after it.`);
    if (low.s < 40 && low.h.id !== top.h.id)
      add("info", "🔧", "Needs redesign, not willpower",
        `"${low.h.name}" is struggling (${low.s}% strength). Don't blame motivation — make it easier: shrink it to two minutes, move it to a better time, or tie it to a stronger cue.`);
  }

  /* journal nudge */
  if (!s.journal[tk]) {
    add("info", "📔", "Tonight's reflection",
      "You haven't written today's reflection yet. Five questions, two minutes — right after you stop using your phone at 9 PM.");
  }

  return cards;
}
