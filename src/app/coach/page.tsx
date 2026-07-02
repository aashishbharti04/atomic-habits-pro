"use client";

import { useApp } from "@/lib/store";
import { coachInsights } from "@/lib/logic";

export default function CoachPage() {
  const { state } = useApp();
  if (!state) return null;
  const cards = coachInsights(state);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Your Coach</h2>
          <p className="hint">Insights computed from your own history — patterns, risks and recommendations. Everything stays on your device.</p>
        </div>
      </div>
      <div className="coach-list">
        {cards.map((c, i) => (
          <div key={i} className={`coach-card ${c.tone}`}>
            <span className="coach-icon">{c.icon}</span>
            <div>
              <b>{c.title}</b>
              <p>{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
