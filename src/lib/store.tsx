"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AppState, Contract, Freq, JournalEntry, Score } from "./types";
import { defaultState } from "./types";
import { currentStreak, MILESTONES, todayKey, uid } from "./logic";
import { seedRoutine } from "./seeds";

const STORE_KEY = "atomicHabitsData"; // same key & shape as v1 → lossless import

export interface Toast {
  id: number;
  msg: string;
}

interface AppApi {
  state: AppState | null; // null until hydrated on the client
  toasts: Toast[];
  toast: (msg: string) => void;
  addHabit: (name: string, freq: Freq) => void;
  editHabit: (id: string, name: string, freq: Freq) => void;
  deleteHabit: (id: string) => void;
  toggleCheck: (habitId: string, key: string) => void;
  cycleCheck: (habitId: string, key: string) => void;
  addScore: (text: string) => void;
  setScore: (id: string, score: Score) => void;
  deleteScore: (id: string) => void;
  addStack: (after: string, will: string) => void;
  deleteStack: (id: string) => void;
  addIntention: (behavior: string, time: string, location: string) => void;
  deleteIntention: (id: string) => void;
  addGoal: (title: string, deadline: string, targetReps: number, habitIds: string[]) => void;
  deleteGoal: (id: string) => void;
  saveJournal: (day: string, entry: JournalEntry) => void;
  saveContract: (c: Contract) => void;
  importJson: (raw: string) => boolean;
  exportJson: () => void;
  exportCsv: () => void;
}

const Ctx = createContext<AppApi | null>(null);

function normalize(s: AppState): AppState {
  const merged: AppState = { ...structuredClone(defaultState), ...s };
  merged.habits.forEach((h) => {
    if (!h.freq) h.freq = "daily";
    if (!h.created) {
      const keys = Object.keys(merged.checks[h.id] ?? {}).sort();
      h.created = keys[0] ?? todayKey();
    }
  });
  return merged;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    let s: AppState;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      s = raw ? normalize(JSON.parse(raw)) : structuredClone(defaultState);
    } catch {
      s = structuredClone(defaultState);
    }
    if (seedRoutine(s)) localStorage.setItem(STORE_KEY, JSON.stringify(s));
    setState(s);
  }, []);

  const toast = useCallback((msg: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const update = useCallback((fn: (s: AppState) => void) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const celebrate = useCallback(
    (s: AppState, habitId: string, key: string) => {
      if (key !== todayKey()) return;
      const h = s.habits.find((x) => x.id === habitId);
      if (!h) return;
      const st = currentStreak(s, h);
      const m = MILESTONES.find((m) => m.days === st);
      if (m) toast(`${m.emoji} ${m.label} — ${st}-day streak on "${h.name}"!`);
      else toast("+10 XP ⚡");
    },
    [toast]
  );

  const api: AppApi = {
    state,
    toasts,
    toast,
    addHabit: (name, freq) => {
      update((s) => s.habits.push({ id: uid(), name, freq, created: todayKey() }));
      toast(`Habit added — ${freq === "daily" ? "every day" : freq}`);
    },
    editHabit: (id, name, freq) => {
      update((s) => {
        const h = s.habits.find((x) => x.id === id);
        if (h) { h.name = name; h.freq = freq; }
      });
      toast("Habit updated");
    },
    deleteHabit: (id) => {
      update((s) => {
        s.habits = s.habits.filter((x) => x.id !== id);
        delete s.checks[id];
      });
      toast("Habit deleted");
    },
    toggleCheck: (habitId, key) => {
      update((s) => {
        if (!s.checks[habitId]) s.checks[habitId] = {};
        const nowChecked = s.checks[habitId][key] !== true;
        if (nowChecked) {
          s.checks[habitId][key] = true;
          celebrate(s, habitId, key);
        } else delete s.checks[habitId][key];
      });
    },
    cycleCheck: (habitId, key) => {
      update((s) => {
        if (!s.checks[habitId]) s.checks[habitId] = {};
        const cur = s.checks[habitId][key];
        if (cur === true) s.checks[habitId][key] = "skip";
        else if (cur === "skip") delete s.checks[habitId][key];
        else {
          s.checks[habitId][key] = true;
          celebrate(s, habitId, key);
        }
      });
    },
    addScore: (text) => update((s) => s.scorecard.push({ id: uid(), text, score: null })),
    setScore: (id, score) =>
      update((s) => {
        const it = s.scorecard.find((x) => x.id === id);
        if (it) it.score = it.score === score ? null : score;
      }),
    deleteScore: (id) => update((s) => { s.scorecard = s.scorecard.filter((x) => x.id !== id); }),
    addStack: (after, will) => {
      update((s) => s.stacks.push({ id: uid(), after, will }));
      toast("Habit stack added");
    },
    deleteStack: (id) => update((s) => { s.stacks = s.stacks.filter((x) => x.id !== id); }),
    addIntention: (behavior, time, location) => {
      update((s) => s.intentions.push({ id: uid(), behavior, time, location }));
      toast("Intention committed");
    },
    deleteIntention: (id) => update((s) => { s.intentions = s.intentions.filter((x) => x.id !== id); }),
    addGoal: (title, deadline, targetReps, habitIds) => {
      update((s) => s.goals.push({ id: uid(), title, deadline, targetReps, habitIds, created: todayKey() }));
      toast("Goal created 🎯");
    },
    deleteGoal: (id) => {
      update((s) => { s.goals = s.goals.filter((x) => x.id !== id); });
      toast("Goal deleted");
    },
    saveJournal: (day, entry) => {
      update((s) => { s.journal[day] = entry; });
      toast("Reflection saved 📔");
    },
    saveContract: (c) => {
      update((s) => { s.contract = c; });
      toast("Contract saved");
    },
    importJson: (raw) => {
      try {
        const data = normalize(JSON.parse(raw));
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        setState(data);
        toast("Data imported");
        return true;
      } catch {
        return false;
      }
    },
    exportJson: () => {
      if (!state) return;
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "atomic-habits-data.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Data exported");
    },
    exportCsv: () => {
      if (!state) return;
      let csv = "habit,frequency,date,status\n";
      for (const h of state.habits) {
        const m = state.checks[h.id] ?? {};
        for (const k of Object.keys(m).sort()) {
          csv += `"${h.name.replace(/"/g, '""')}",${h.freq},${k},${m[k] === true ? "done" : "skipped"}\n`;
        }
      }
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "atomic-habits-history.csv";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("CSV exported");
    },
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp(): AppApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
