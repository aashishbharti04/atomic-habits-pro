"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { FREQ_LABEL } from "@/lib/logic";
import { SUGGESTIONS } from "@/lib/seeds";
import { CheckIcon, PlusIcon } from "@/components/icons";

const CATS = ["All", ...new Set(SUGGESTIONS.map((s) => s.cat))];

export default function DiscoverPage() {
  const { state, addHabit } = useApp();
  const [filter, setFilter] = useState("All");
  if (!state) return null;

  const exists = (name: string) =>
    state.habits.some((h) => h.name.trim().toLowerCase() === name.trim().toLowerCase());

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Positive Habit Library</h2>
          <p className="hint">Proven habits worth adopting — each with a two-minute starter and a place in your routine</p>
        </div>
      </div>
      <div className="filter-chips">
        {CATS.map((c) => (
          <button key={c} className={`chip-btn ${c === filter ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div className="sug-grid">
        {SUGGESTIONS.filter((s) => filter === "All" || s.cat === filter).map((s) => {
          const added = exists(s.name);
          return (
            <div key={s.name} className="sug-card">
              <div className="sug-top">
                <span className="sug-emoji">{s.emoji}</span>
                <span className="sug-name">{s.name}</span>
                <span className="sug-cat">{s.cat}</span>
              </div>
              <p className="sug-why">{s.why}</p>
              <p className="sug-meta">
                <b>Start tiny:</b> {s.twoMin}<br />
                <b>Stack it:</b> {s.anchor}
              </p>
              <div className="sug-foot">
                <span className="sug-freq">{FREQ_LABEL[s.freq]}</span>
                {added ? (
                  <button className="sug-add added"><CheckIcon /> Added</button>
                ) : (
                  <button className="sug-add" onClick={() => addHabit(s.name, s.freq)}><PlusIcon /> Add habit</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
