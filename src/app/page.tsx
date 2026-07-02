"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import {
  bestStreak, countsOn, currentStreak, dateKey, FREQ_LABEL,
  isChecked, isScheduled, isSkipped, todayKey,
} from "@/lib/logic";
import { TIPS } from "@/lib/seeds";
import type { AppState, Freq, Habit } from "@/lib/types";
import { BulbIcon, CheckIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";

function ProgressRing({ state }: { state: AppState }) {
  const now = new Date();
  const key = todayKey();
  const scheduled = state.habits.filter((h) => countsOn(state, h, now, key));
  const done = scheduled.filter((h) => isChecked(state, h.id, key)).length;
  const pct = scheduled.length ? done / scheduled.length : 0;
  const C = 2 * Math.PI * 52;
  const caption = !state.habits.length
    ? "No habits yet — add one below"
    : !scheduled.length
      ? "Rest day — nothing scheduled today"
      : done === scheduled.length
        ? "All done — cast every vote today 🎉"
        : `${scheduled.length - done} habit${scheduled.length - done > 1 ? "s" : ""} left today`;
  return (
    <div className="card ring-card">
      <div className="ring-wrap">
        <svg viewBox="0 0 120 120" className="ring">
          <circle className="ring-bg" cx="60" cy="60" r="52" />
          <circle
            className="ring-fg" cx="60" cy="60" r="52"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          />
        </svg>
        <div className="ring-label">
          <span>{Math.round(pct * 100)}%</span>
          <small>today</small>
        </div>
      </div>
      <p className="ring-caption">{caption}</p>
    </div>
  );
}

function Stats({ state }: { state: AppState }) {
  const now = new Date();
  const key = todayKey();
  const scheduled = state.habits.filter((h) => countsOn(state, h, now, key));
  const doneToday = scheduled.filter((h) => isChecked(state, h.id, key)).length;
  const best = state.habits.reduce((m, h) => Math.max(m, bestStreak(state, h)), 0);
  let possible = 0, done = 0;
  const d = new Date();
  for (let i = 0; i < 30; i++) {
    const k = dateKey(d);
    for (const h of state.habits) {
      if (!countsOn(state, h, d, k)) continue;
      possible++;
      if (isChecked(state, h.id, k)) done++;
    }
    d.setDate(d.getDate() - 1);
  }
  const pct30 = possible ? Math.round((done / possible) * 100) : 0;
  return (
    <div className="stats-grid">
      <div className="stat"><div className="num">{doneToday}<span className="accent">/{scheduled.length}</span></div><div className="lbl">habits done today</div></div>
      <div className="stat"><div className="num">{best} <span className="accent">🔥</span></div><div className="lbl">best streak (days)</div></div>
      <div className="stat"><div className="num">{pct30}<span className="accent">%</span></div><div className="lbl">30-day completion</div></div>
      <div className="stat"><div className="num">{state.habits.length}</div><div className="lbl">habits tracked</div></div>
    </div>
  );
}

function Chart14({ state }: { state: AppState }) {
  const days: { pct: number; label: string; dateNum: number; isToday: boolean }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - 13);
  for (let i = 0; i < 14; i++) {
    const k = dateKey(d);
    const scheduled = state.habits.filter((h) => countsOn(state, h, d, k));
    const done = scheduled.filter((h) => isChecked(state, h.id, k)).length;
    days.push({
      pct: scheduled.length ? done / scheduled.length : 0,
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      dateNum: d.getDate(),
      isToday: k === todayKey(),
    });
    d.setDate(d.getDate() + 1);
  }
  const W = 560, H = 130, pad = 4, gap = 6;
  const bw = (W - pad * 2 - gap * 13) / 14;
  const maxH = 92;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-label="14 day completion chart">
        {days.map((day, i) => {
          const x = pad + i * (bw + gap);
          const h = Math.max(4, day.pct * maxH);
          const y = 8 + (maxH - h);
          const cls = day.pct === 0 ? "bar zero" : day.isToday ? "bar today-bar" : "bar";
          return (
            <g key={i}>
              <rect className={cls} x={x} y={y} width={bw} height={h} rx="3">
                <title>{Math.round(day.pct * 100)}%</title>
              </rect>
              <text x={x + bw / 2} y={H - 18} textAnchor="middle">{day.label}</text>
              <text x={x + bw / 2} y={H - 6} textAnchor="middle">{day.dateNum}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HabitRow({ state, habit }: { state: AppState; habit: Habit }) {
  const { toggleCheck, editHabit, deleteHabit } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [freq, setFreq] = useState<Freq>(habit.freq);

  const t = new Date();
  const key = todayKey();
  const scheduled = isScheduled(habit, t);
  const skippedToday = isSkipped(state, habit.id, key);
  const done = isChecked(state, habit.id, key);
  const streak = currentStreak(state, habit);

  if (editing) {
    const commit = () => {
      if (!name.trim()) return;
      editHabit(habit.id, name.trim(), freq);
      setEditing(false);
    };
    return (
      <li>
        <div className="habit-edit-row">
          <input type="text" value={name} maxLength={80} autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()} />
          <select value={freq} onChange={(e) => setFreq(e.target.value as Freq)}>
            <option value="daily">Every day</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
          </select>
          <button className="btn primary" onClick={commit}>Save</button>
          <button className="btn" onClick={() => { setEditing(false); setName(habit.name); setFreq(habit.freq); }}>Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className={!scheduled || skippedToday ? "off-today" : ""}>
      <button className={`habit-check ${done ? "checked" : ""}`} aria-label="toggle" onClick={() => toggleCheck(habit.id, key)}>
        <CheckIcon />
      </button>
      <span className={`habit-name ${done ? "done" : ""}`}>{habit.name}</span>
      {habit.freq !== "daily" && <span className="chip">{FREQ_LABEL[habit.freq]}</span>}
      {!scheduled && <span className="chip rest">rest day</span>}
      {skippedToday && <span className="chip rest">skipped</span>}
      {streak > 0 && <span className="chip streak">🔥 {streak} day{streak > 1 ? "s" : ""}</span>}
      <button className="edit-btn" title="Edit habit" onClick={() => setEditing(true)}><PencilIcon /></button>
      <button className="del-btn" title="Delete habit"
        onClick={() => confirm(`Delete habit "${habit.name}" and its history?`) && deleteHabit(habit.id)}>
        <TrashIcon />
      </button>
    </li>
  );
}

export default function TodayPage() {
  const { state, addHabit } = useApp();
  const [name, setName] = useState("");
  const [freq, setFreq] = useState<Freq>("daily");

  if (!state) return null;

  const t = new Date();
  const tip = TIPS[(t.getDate() + t.getMonth()) % TIPS.length];
  const submit = () => {
    if (!name.trim()) return;
    addHabit(name.trim(), freq);
    setName("");
  };

  return (
    <>
      <div className="hero-grid">
        <ProgressRing state={state} />
        <Stats state={state} />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Today&apos;s Habits</h2>
            <p className="hint">{t.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <span className="hint">Never miss twice</span>
        </div>
        <div className="add-row">
          <input type="text" placeholder="Add a new habit… e.g. Do 10 push-ups" maxLength={80}
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          <select value={freq} onChange={(e) => setFreq(e.target.value as Freq)} title="How often?">
            <option value="daily">Every day</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
          </select>
          <button className="btn primary" onClick={submit}><PlusIcon /> Add Habit</button>
        </div>
        <ul className="habit-list">
          {state.habits.map((h) => <HabitRow key={h.id} state={state} habit={h} />)}
        </ul>
        {!state.habits.length && (
          <p className="empty-msg">No habits yet. Add your first habit above — start with something that takes <b>two minutes or less</b>.</p>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <div><h2>Last 14 Days</h2><p className="hint">Daily completion of scheduled habits</p></div>
        </div>
        <Chart14 state={state} />
      </div>

      <div className="card tip-card">
        <div className="tip-icon"><BulbIcon /></div>
        <div>
          <h3>Rule of the day</h3>
          <p>{tip}</p>
        </div>
      </div>
    </>
  );
}
