"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { currentStreak, FREQ_LABEL, isChecked, isScheduled, isSkipped } from "@/lib/logic";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export default function CalendarPage() {
  const { state, cycleCheck } = useApp();
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getFullYear() * 12 + now.getMonth());

  if (!state) return null;

  const year = Math.floor(calMonth / 12);
  const month = calMonth % 12;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isThisMonth = now.getFullYear() === year && now.getMonth() === month;
  const todayDate = now.getDate();
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Habit Tracker</h2>
          <p className="hint">Don&apos;t break the chain — click a cell to mark it done</p>
        </div>
        <div className="month-nav">
          <button className="icon-btn" onClick={() => setCalMonth(calMonth - 1)}><ChevronLeftIcon /></button>
          <span>{monthLabel}</span>
          <button className="icon-btn" onClick={() => setCalMonth(calMonth + 1)}><ChevronRightIcon /></button>
        </div>
      </div>

      {state.habits.length ? (
        <div className="tracker-wrap">
          <table className="tracker">
            <thead>
              <tr>
                <th className="habit-col">Habit</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <th key={d} className={isThisMonth && d === todayDate ? "today-col" : ""}>{d}</th>
                ))}
                <th>🔥</th>
              </tr>
            </thead>
            <tbody>
              {state.habits.map((h) => (
                <tr key={h.id}>
                  <td className="habit-col" title={`${h.name} (${FREQ_LABEL[h.freq]})`}>{h.name}</td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const cellDate = new Date(year, month, d);
                    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    const done = isChecked(state, h.id, key);
                    const skipped = isSkipped(state, h.id, key);
                    const off = !isScheduled(h, cellDate);
                    const future = cellDate > now && !(isThisMonth && d === todayDate);
                    const cls = [
                      "day-cell",
                      done ? "done" : "",
                      skipped ? "skip" : "",
                      off ? "off" : "",
                      isThisMonth && d === todayDate ? "today-cell" : "",
                      future ? "future" : "",
                    ].filter(Boolean).join(" ");
                    const clickable = !off && !future;
                    return (
                      <td key={d} className={cls} tabIndex={clickable ? 0 : undefined}
                        onClick={clickable ? () => cycleCheck(h.id, key) : undefined}
                        onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cycleCheck(h.id, key); } } : undefined}
                      />
                    );
                  })}
                  <td className="streak-cell">{currentStreak(state, h)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-msg">Add habits on the <b>Today</b> page to start tracking them here.</p>
      )}

      <div className="legend">
        <span><span className="cell-demo done" /> done</span>
        <span><span className="cell-demo" /> not done</span>
        <span><span className="cell-demo skip" /> skipped (vacation — keeps streak)</span>
        <span><span className="cell-demo off" /> rest day</span>
        <span><span className="cell-demo today-demo" /> today</span>
      </div>
      <p className="hint" style={{ marginTop: ".5rem" }}>Clicking a cell cycles: <b>done → skipped → clear</b>.</p>
    </div>
  );
}
