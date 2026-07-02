"use client";

import { useApp } from "@/lib/store";
import {
  bestStreak, checksCount, countsOn, currentStreak, dateKey, FREQ_LABEL,
  habitStrength, isChecked, MILESTONES, todayKey,
} from "@/lib/logic";
import type { AppState } from "@/lib/types";
import { DownloadIcon } from "@/components/icons";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Heatmap({ state }: { state: AppState }) {
  const WEEKS = 26;
  const now = new Date();
  const tk = todayKey();
  const start = new Date();
  start.setDate(start.getDate() - (WEEKS * 7 - 1) - start.getDay());
  const cells: { key: string; cls: string; title: string }[] = [];
  const d = new Date(start);
  while (d <= now) {
    const k = dateKey(d);
    const scheduled = state.habits.filter((h) => countsOn(state, h, d, k));
    let cls: string;
    const doneCount = scheduled.filter((h) => isChecked(state, h.id, k)).length;
    if (!scheduled.length) cls = "hm-none";
    else {
      const pct = doneCount / scheduled.length;
      cls = pct === 0 ? "hm-l0" : pct < 0.34 ? "hm-l1" : pct < 0.67 ? "hm-l2" : pct < 1 ? "hm-l3" : "hm-l4";
    }
    const label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    cells.push({ key: k, cls: `${cls} ${k === tk ? "hm-today" : ""}`, title: `${label} — ${doneCount}/${scheduled.length} done` });
    d.setDate(d.getDate() + 1);
  }
  return (
    <div className="heatmap-wrap">
      <div className="heatmap">
        {cells.map((c) => <span key={c.key} className={`hm-cell ${c.cls}`} title={c.title} />)}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { state, exportCsv } = useApp();
  if (!state) return null;

  /* summary cards */
  let totalReps = 0;
  for (const h of state.habits) totalReps += checksCount(state, h);
  let perfectDays = 0;
  const byWeekday = Array.from({ length: 7 }, () => ({ done: 0, poss: 0 }));
  const wd = new Date();
  for (let i = 0; i < 84; i++) {
    const k = dateKey(wd);
    const scheduled = state.habits.filter((h) => countsOn(state, h, wd, k));
    if (scheduled.length) {
      const done = scheduled.filter((h) => isChecked(state, h.id, k)).length;
      if (i < 30 && done === scheduled.length) perfectDays++;
      byWeekday[wd.getDay()].done += done;
      byWeekday[wd.getDay()].poss += scheduled.length;
    }
    wd.setDate(wd.getDate() - 1);
  }
  let bestDay = "—", bestRate = -1;
  byWeekday.forEach((v, i) => {
    if (v.poss >= 4) {
      const rate = v.done / v.poss;
      if (rate > bestRate) { bestRate = rate; bestDay = DAY_NAMES[i]; }
    }
  });
  const avgStrength = state.habits.length
    ? Math.round(state.habits.reduce((s, h) => s + habitStrength(state, h), 0) / state.habits.length)
    : 0;
  const maxBest = state.habits.reduce((m, h) => Math.max(m, bestStreak(state, h)), 0);

  return (
    <>
      <div className="stats-grid" style={{ marginBottom: "1.1rem" }}>
        <div className="stat"><div className="num">{totalReps}</div><div className="lbl">total reps — every one a vote</div></div>
        <div className="stat"><div className="num">{perfectDays}<span className="accent">/30</span></div><div className="lbl">perfect days, last 30</div></div>
        <div className="stat"><div className="num">{avgStrength}<span className="accent">%</span></div><div className="lbl">average habit strength</div></div>
        <div className="stat"><div className="num" style={{ fontSize: "1.15rem" }}>{bestDay}</div><div className="lbl">your strongest day (12 weeks)</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <div><h2>Consistency Heatmap</h2><p className="hint">Last 6 months — every square is a day, darker means more habits completed</p></div>
        </div>
        <Heatmap state={state} />
        <div className="legend hm-legend">
          <span>less</span>
          <span className="hm-cell hm-l0" /><span className="hm-cell hm-l1" /><span className="hm-cell hm-l2" /><span className="hm-cell hm-l3" /><span className="hm-cell hm-l4" />
          <span>more</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div><h2>Habit Statistics</h2><p className="hint">Strength is a weighted score of your recent consistency — it forgives one bad day, a streak doesn&apos;t</p></div>
          <button className="btn" onClick={exportCsv}><DownloadIcon /> Export CSV</button>
        </div>
        {state.habits.length ? (
          <div className="table-wrap">
            <table className="stats-table">
              <thead>
                <tr><th>Habit</th><th>Strength</th><th>Streak</th><th>Best</th><th>30-day</th><th>Total</th></tr>
              </thead>
              <tbody>
                {state.habits.map((h) => {
                  const strength = habitStrength(state, h);
                  let poss = 0, done = 0;
                  const sd = new Date();
                  for (let i = 0; i < 30; i++) {
                    if (countsOn(state, h, sd)) { poss++; if (isChecked(state, h.id, dateKey(sd))) done++; }
                    sd.setDate(sd.getDate() - 1);
                  }
                  return (
                    <tr key={h.id}>
                      <td className="habit-cell" title={h.name}>
                        {h.name}<br /><span className="freq-cell">{FREQ_LABEL[h.freq]}</span>
                      </td>
                      <td>
                        <span className="strength-track"><span className="strength-fill" style={{ width: `${strength}%` }} /></span>
                        <span className="strength-num">{strength}%</span>
                      </td>
                      <td>🔥 {currentStreak(state, h)}d</td>
                      <td>{bestStreak(state, h)}d</td>
                      <td>{poss ? Math.round((done / poss) * 100) : 0}%</td>
                      <td>{checksCount(state, h)}✓</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-msg">Add habits on the <b>Today</b> page to see statistics.</p>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <div><h2>Achievements</h2><p className="hint">Milestone badges — earned by your best streak on any habit</p></div>
        </div>
        <div className="badge-shelf">
          {MILESTONES.map((m) => {
            const earned = maxBest >= m.days;
            return (
              <div key={m.days} className={`badge ${earned ? "earned" : "locked"}`}>
                <span className="badge-emoji">{m.emoji}</span>
                <b>{m.label}</b>
                <small>{m.sub}</small>
                <small>{earned ? "✓ earned" : `${maxBest}/${m.days} days`}</small>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
