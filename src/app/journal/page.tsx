"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { todayKey } from "@/lib/logic";
import type { JournalEntry } from "@/lib/types";

const EMPTY: JournalEntry = { well: "", improve: "", win: "", distraction: "", priority: "" };
const FIELDS: { key: keyof JournalEntry; label: string }[] = [
  { key: "well", label: "What went well today?" },
  { key: "improve", label: "What could be improved?" },
  { key: "win", label: "Biggest win of the day?" },
  { key: "distraction", label: "Biggest distraction?" },
  { key: "priority", label: "Tomorrow's #1 priority?" },
];
const HIST_LABELS: Record<keyof JournalEntry, string> = {
  well: "What went well", improve: "Could be improved", win: "Biggest win",
  distraction: "Biggest distraction", priority: "Tomorrow's priority",
};

export default function JournalPage() {
  const { state, saveJournal, toast } = useApp();
  const [day, setDay] = useState(todayKey());
  const [entry, setEntry] = useState<JournalEntry>(EMPTY);

  useEffect(() => {
    if (state) setEntry(state.journal[day] ?? EMPTY);
  }, [state, day]);

  if (!state) return null;

  const past = Object.keys(state.journal).sort().reverse().slice(0, 30);

  const save = () => {
    const trimmed: JournalEntry = {
      well: entry.well.trim(), improve: entry.improve.trim(), win: entry.win.trim(),
      distraction: entry.distraction.trim(), priority: entry.priority.trim(),
    };
    if (Object.values(trimmed).every((v) => !v)) { toast("Write at least one answer"); return; }
    saveJournal(day, trimmed);
  };

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Daily Reflection</h2>
            <p className="hint">Five questions, two minutes — awareness is the first step of every change</p>
          </div>
          <input type="date" style={{ width: "auto" }} value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        {FIELDS.map((f) => (
          <label key={f.key} className="form-label">{f.label}
            <textarea rows={2} value={entry[f.key]}
              onChange={(e) => setEntry({ ...entry, [f.key]: e.target.value })} />
          </label>
        ))}
        <button className="btn primary" onClick={save}>Save Reflection</button>
      </div>

      <div className="card">
        <div className="card-head"><div><h2>Past Reflections</h2></div></div>
        {past.length ? past.map((k) => {
          const e = state.journal[k];
          const teaser = e.win || e.well || e.priority || "";
          return (
            <details key={k} className="journal-entry">
              <summary>
                <span>{new Date(k + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                <small>{teaser}</small>
              </summary>
              <dl>
                {(Object.keys(HIST_LABELS) as (keyof JournalEntry)[]).map((f) =>
                  e[f] ? (
                    <div key={f}>
                      <dt>{HIST_LABELS[f]}</dt>
                      <dd>{e[f]}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            </details>
          );
        }) : (
          <p className="empty-msg">No reflections yet — tonight at 9 PM is a perfect first slot.</p>
        )}
      </div>
    </>
  );
}
