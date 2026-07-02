"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { goalStatus, todayKey } from "@/lib/logic";
import { TrashIcon } from "@/components/icons";

export default function GoalsPage() {
  const { state, addGoal, deleteGoal, toast } = useApp();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [target, setTarget] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  if (!state) return null;

  const create = () => {
    const targetReps = parseInt(target, 10);
    if (!title.trim() || !deadline || !targetReps || targetReps < 1) { toast("Fill goal, deadline and target reps"); return; }
    if (!sel.size) { toast("Link at least one habit"); return; }
    if (deadline < todayKey()) { toast("Deadline must be in the future"); return; }
    addGoal(title.trim(), deadline, targetReps, [...sel]);
    setTitle(""); setDeadline(""); setTarget(""); setSel(new Set());
  };

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <h2>New Goal</h2>
            <p className="hint">You do not rise to your goals — you fall to your systems. Link habits to every goal.</p>
          </div>
        </div>
        <div className="goal-form-grid">
          <label className="form-label">Goal
            <input type="text" placeholder="e.g. Read 12 books this year" maxLength={90}
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="form-label">Deadline
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <label className="form-label">Target reps
            <input type="number" min={1} max={10000} placeholder="e.g. 180"
              value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
        </div>
        <p className="hint" style={{ margin: ".5rem 0 .3rem" }}>Linked habits (their completions count toward this goal):</p>
        <div className="goal-habit-picker">
          {state.habits.length ? state.habits.map((h) => (
            <span key={h.id}
              className={`goal-habit-pill ${sel.has(h.id) ? "sel" : ""}`}
              onClick={() => setSel((prev) => {
                const next = new Set(prev);
                if (next.has(h.id)) next.delete(h.id); else next.add(h.id);
                return next;
              })}>
              {h.name}
            </span>
          )) : <span className="hint">Add habits first — goals are powered by habits.</span>}
        </div>
        <button className="btn primary" style={{ marginTop: ".8rem" }} onClick={create}>Create Goal</button>
      </div>

      {state.goals.map((g) => {
        const { reps, pct, daysLeft, status, cls } = goalStatus(state, g);
        const names = g.habitIds.map((id) => state.habits.find((h) => h.id === id)).filter(Boolean).map((h) => h!.name);
        return (
          <div key={g.id} className="card">
            <div className="goal-top">
              <div>
                <h3>{g.title}</h3>
                <div className="goal-meta">
                  <span><b>{reps}</b>/{g.targetReps} reps</span>
                  <span>{daysLeft} days left</span>
                  <span>due {new Date(g.deadline + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className={`goal-status ${cls}`}>{status}</span>
                </div>
              </div>
              <button className="del-btn" title="Delete goal"
                onClick={() => confirm(`Delete goal "${g.title}"?`) && deleteGoal(g.id)}>
                <TrashIcon />
              </button>
            </div>
            <div className="goal-bar"><span className="goal-fill" style={{ width: `${pct}%` }} /></div>
            <div className="goal-habits-row">
              {names.map((n) => <span key={n} className="chip">{n}</span>)}
            </div>
          </div>
        );
      })}
      {!state.goals.length && (
        <p className="empty-msg">No goals yet. A good first goal: <b>&quot;Cast 60 votes in 30 days&quot;</b> — link all your habits and set target reps to 60.</p>
      )}
    </>
  );
}
