"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { TrashIcon } from "@/components/icons";

export default function IntentionsPage() {
  const { state, addIntention, deleteIntention } = useApp();
  const [behavior, setBehavior] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  if (!state) return null;

  const submit = () => {
    if (!behavior.trim() || !time.trim() || !location.trim()) return;
    addIntention(behavior.trim(), time.trim(), location.trim());
    setBehavior(""); setTime(""); setLocation("");
  };

  return (
    <div className="card">
      <div className="card-head">
        <div><h2>Implementation Intentions</h2><p className="hint">1st Law · Make It Obvious</p></div>
      </div>
      <p className="explain">
        People who plan <i>when</i> and <i>where</i> they will act are far more likely to follow through:{" "}
        <b>&quot;I will [BEHAVIOR] at [TIME] in [LOCATION].&quot;</b>
      </p>
      <div className="builder">
        <span className="builder-word">I will</span>
        <input type="text" placeholder="exercise" maxLength={80}
          value={behavior} onChange={(e) => setBehavior(e.target.value)} />
        <span className="builder-word">at</span>
        <input type="text" placeholder="7:00 AM" maxLength={40}
          value={time} onChange={(e) => setTime(e.target.value)} />
        <span className="builder-word">in</span>
        <input type="text" placeholder="my local gym" maxLength={60}
          value={location} onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button className="btn primary" onClick={submit}>Commit</button>
      </div>
      <ul className="formula-list">
        {state.intentions.map((it) => (
          <li key={it.id}>
            <span className="formula-text">I will <b>{it.behavior}</b> at <b>{it.time}</b> in <b>{it.location}</b>.</span>
            <button className="del-btn" onClick={() => deleteIntention(it.id)}><TrashIcon /></button>
          </li>
        ))}
      </ul>
      {!state.intentions.length && (
        <p className="empty-msg">No intentions yet. Vague plans fail — give every habit a time and a place.</p>
      )}
    </div>
  );
}
