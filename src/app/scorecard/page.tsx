"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { PlusIcon, TrashIcon } from "@/components/icons";

export default function ScorecardPage() {
  const { state, addScore, setScore, deleteScore } = useApp();
  const [text, setText] = useState("");
  if (!state) return null;

  const submit = () => {
    if (!text.trim()) return;
    addScore(text.trim());
    setText("");
  };

  const pos = state.scorecard.filter((x) => x.score === "+").length;
  const neg = state.scorecard.filter((x) => x.score === "-").length;
  const neu = state.scorecard.filter((x) => x.score === "=").length;

  return (
    <div className="card">
      <div className="card-head">
        <div><h2>The Habits Scorecard</h2><p className="hint">Awareness comes before change</p></div>
        {state.scorecard.length > 0 && (
          <div className="score-summary-chips">
            <span className="chip good">+ {pos} good</span>
            <span className="chip neutral">= {neu} neutral</span>
            <span className="chip bad">– {neg} bad</span>
          </div>
        )}
      </div>
      <p className="explain">
        Walk through your day in order and score every behavior:{" "}
        <b className="pos">+</b> good habit · <b className="neg">–</b> bad habit · <b className="neu">=</b> neutral.
        Judge by whether it benefits <i>the person you want to become</i>. Just observe — no need to change anything yet.
      </p>
      <div className="add-row">
        <input type="text" placeholder="e.g. Wake up · Check phone · Drink coffee…" maxLength={80}
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button className="btn primary" onClick={submit}><PlusIcon /> Add</button>
      </div>
      <ul className="score-list">
        {state.scorecard.map((item, i) => (
          <li key={item.id}>
            <span className="score-idx">{i + 1}.</span>
            <span className="score-text">{item.text}</span>
            <span className="score-btns">
              <button className={`score-btn ${item.score === "+" ? "sel-pos" : ""}`} onClick={() => setScore(item.id, "+")}>+</button>
              <button className={`score-btn ${item.score === "=" ? "sel-neu" : ""}`} onClick={() => setScore(item.id, "=")}>=</button>
              <button className={`score-btn ${item.score === "-" ? "sel-neg" : ""}`} onClick={() => setScore(item.id, "-")}>–</button>
            </span>
            <button className="del-btn" title="Remove" onClick={() => deleteScore(item.id)}><TrashIcon /></button>
          </li>
        ))}
      </ul>
      {!state.scorecard.length && (
        <p className="empty-msg">Nothing listed yet. Walk through your day in your head and write down each behavior in order.</p>
      )}
    </div>
  );
}
