"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import type { Contract } from "@/lib/types";

export default function ContractPage() {
  const { state, saveContract } = useApp();
  const [c, setC] = useState<Contract>({ promise: "", penalty: "", partner: "", name: "", date: "" });

  useEffect(() => {
    if (state) setC(state.contract);
  }, [state]);

  if (!state) return null;

  return (
    <div className="print-contract">
      <div className="card">
        <div className="card-head">
          <div><h2>Habit Contract</h2><p className="hint">4th Law inversion · Make It Unsatisfying</p></div>
        </div>
        <p className="explain">
          Make the cost of breaking your habit public and painful. Write the contract, set a consequence,
          and have an accountability partner sign it with you.
        </p>
        <label className="form-label">My commitment
          <textarea rows={2} placeholder="I will track my habits every evening at 9 PM for the next 30 days."
            value={c.promise} onChange={(e) => setC({ ...c, promise: e.target.value })} />
        </label>
        <label className="form-label">If I fail, the consequence is
          <textarea rows={2} placeholder="I pay ₹500 to my accountability partner / do 50 push-ups."
            value={c.penalty} onChange={(e) => setC({ ...c, penalty: e.target.value })} />
        </label>
        <div className="contract-grid">
          <label className="form-label">Accountability partner
            <input type="text" placeholder="Partner's name"
              value={c.partner} onChange={(e) => setC({ ...c, partner: e.target.value })} />
          </label>
          <label className="form-label">Signed by
            <input type="text" placeholder="Your name"
              value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          </label>
          <label className="form-label">Date
            <input type="date" value={c.date} onChange={(e) => setC({ ...c, date: e.target.value })} />
          </label>
        </div>
        <div className="contract-actions" style={{ display: "flex", gap: ".6rem", marginTop: ".5rem" }}>
          <button className="btn primary" onClick={() => saveContract({
            promise: c.promise.trim(), penalty: c.penalty.trim(),
            partner: c.partner.trim(), name: c.name.trim(), date: c.date,
          })}>Save Contract</button>
          <button className="btn" onClick={() => window.print()}>Print</button>
        </div>
      </div>
    </div>
  );
}
