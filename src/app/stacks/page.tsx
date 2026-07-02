"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { TrashIcon } from "@/components/icons";

export default function StacksPage() {
  const { state, addStack, deleteStack } = useApp();
  const [after, setAfter] = useState("");
  const [will, setWill] = useState("");
  if (!state) return null;

  const submit = () => {
    if (!after.trim() || !will.trim()) return;
    addStack(after.trim(), will.trim());
    setAfter(""); setWill("");
  };

  return (
    <div className="card">
      <div className="card-head">
        <div><h2>Habit Stacking</h2><p className="hint">1st Law · Make It Obvious</p></div>
      </div>
      <p className="explain">
        Pair a new habit with a current one — your existing routine is the cue:{" "}
        <b>&quot;After [CURRENT HABIT], I will [NEW HABIT].&quot;</b>
      </p>
      <div className="builder">
        <span className="builder-word">After I</span>
        <input type="text" placeholder="pour my morning coffee" maxLength={80}
          value={after} onChange={(e) => setAfter(e.target.value)} />
        <span className="builder-word">, I will</span>
        <input type="text" placeholder="meditate for one minute" maxLength={80}
          value={will} onChange={(e) => setWill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button className="btn primary" onClick={submit}>Stack It</button>
      </div>
      <ul className="formula-list">
        {state.stacks.map((s) => (
          <li key={s.id}>
            <span className="formula-text">After I <b>{s.after}</b>, I will <b>{s.will}</b>.</span>
            <button className="del-btn" onClick={() => deleteStack(s.id)}><TrashIcon /></button>
          </li>
        ))}
      </ul>
      {!state.stacks.length && (
        <p className="empty-msg">No stacks yet. Anchor a tiny new habit to something you already do every day.</p>
      )}
    </div>
  );
}
