"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";
import { FinancialProfile, Goal, GoalPayload, GoalType } from "../types/dashboard.types";
import { Wallet, Target, Plus, Pencil } from "lucide-react";

const inputClass = "hd-input p-2.5";
const labelClass = "block font-bold mb-1 text-sm";

const GOAL_TYPES: GoalType[] = ["emergency_fund", "vacation", "net_worth", "home", "investment", "custom"];

interface NetWorthTabProps {
  profile: FinancialProfile | null;
  goals: Goal[];
  onRefetch: () => void;
}

export function NetWorthTab({ profile, goals, onRefetch }: NetWorthTabProps) {
  return (
    <div className="space-y-8">
      <FinancialProfileForm profile={profile} onSaved={onRefetch} />
      <GoalsManager goals={goals} onChanged={onRefetch} />
    </div>
  );
}

function FinancialProfileForm({ profile, onSaved }: { profile: FinancialProfile | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    age: profile?.age?.toString() ?? "",
    annualSalary: profile?.annualSalary ?? "",
    monthlyTakeHome: profile?.monthlyTakeHome ?? "",
    monthlyExpenses: profile?.monthlyExpenses ?? "",
    targetNetWorth: profile?.targetNetWorth ?? "",
    tfsaCarryForwardBase: profile?.tfsaCarryForwardBase ?? "",
    fhsaCarryForwardBase: profile?.fhsaCarryForwardBase ?? "",
    rrspKnownRoom: profile?.rrspKnownRoom ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, number> = {};
      for (const [key, value] of Object.entries(form)) {
        if (value !== "" && value !== null) payload[key] = Number(value);
      }

      const res = await apiFetch("/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save financial profile");
      }

      setMessage({ type: "success", text: "Financial profile saved." });
      onSaved();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save financial profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hd-card p-6">
      <h3 className="text-2xl mb-1 flex items-center gap-2">
        <Wallet className="w-5 h-5" style={{ color: "var(--accent-2)" }} /> Financial Profile
      </h3>
      <p className="text-sm mb-6" style={{ opacity: 0.7 }}>
        This is your own data — the planning engine calculates everything from what you enter here, not fixed assumptions.
      </p>

      {message && (
        <div
          className="mb-4 text-sm px-3 py-2 rotate-1"
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius-wobbly-sm)",
            background: message.type === "success" ? "#e8f3e3" : "#fff9c4",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold mb-3" style={{ opacity: 0.6 }}>Income &amp; Expenses</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" value={form.age} onChange={update("age")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Annual Salary</label>
              <input type="number" step="0.01" value={form.annualSalary} onChange={update("annualSalary")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Monthly Take-Home</label>
              <input type="number" step="0.01" value={form.monthlyTakeHome} onChange={update("monthlyTakeHome")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Monthly Expenses</label>
              <input type="number" step="0.01" value={form.monthlyExpenses} onChange={update("monthlyExpenses")} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider font-bold mb-3" style={{ opacity: 0.6 }}>Net Worth Target</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Target Net Worth</label>
              <input type="number" step="0.01" value={form.targetNetWorth} onChange={update("targetNetWorth")} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider font-bold mb-3" style={{ opacity: 0.6 }}>Registered Account Carry-Forward</div>
          <p className="text-xs mb-3" style={{ opacity: 0.6 }}>
            From your CRA My Account / latest Notice of Assessment — this is the only authoritative source for prior-year unused room.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>TFSA Carry-Forward</label>
              <input type="number" step="0.01" value={form.tfsaCarryForwardBase} onChange={update("tfsaCarryForwardBase")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>FHSA Carry-Forward</label>
              <input type="number" step="0.01" value={form.fhsaCarryForwardBase} onChange={update("fhsaCarryForwardBase")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RRSP Known Room</label>
              <input type="number" step="0.01" value={form.rrspKnownRoom} onChange={update("rrspKnownRoom")} className={inputClass} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="hd-btn px-5 py-2.5">
          {saving ? "Saving..." : "Save Financial Profile"}
        </button>
      </form>
    </div>
  );
}

function GoalsManager({ goals, onChanged }: { goals: Goal[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalPayload>({ name: "", type: "custom", targetAmount: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEfMinimum = goals.some((g) => g.type === "emergency_fund" && g.name.toLowerCase().includes("minimum"));
  const hasEfIdeal = goals.some((g) => g.type === "emergency_fund" && !g.name.toLowerCase().includes("minimum"));
  const hasNetWorth = goals.some((g) => g.type === "net_worth");

  const openCreate = (preset?: Partial<GoalPayload>) => {
    setEditingId(null);
    setForm({ name: "", type: "custom", targetAmount: 0, ...preset });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      type: goal.type,
      targetAmount: Number(goal.targetAmount),
      targetDate: goal.targetDate ?? undefined,
      priority: goal.priority,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(editingId ? `/goals/${editingId}` : "/goals", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save goal");
      }

      setShowForm(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hd-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: "var(--accent-2)" }} /> Goals
        </h3>
        <button onClick={() => openCreate()} className="hd-btn hd-btn--secondary px-3 py-1.5 text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {(!hasEfMinimum || !hasEfIdeal || !hasNetWorth) && (
        <div
          className="mb-4 p-3 text-xs space-y-2 rotate-1"
          style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)", background: "var(--postit)" }}
        >
          <div>Some dashboard progress bars use built-in defaults until you set these goals:</div>
          <div className="flex flex-wrap gap-2">
            {!hasEfMinimum && (
              <button onClick={() => openCreate({ name: "Emergency Fund - Minimum", type: "emergency_fund", targetAmount: 5000 })} className="hd-badge cursor-pointer">
                + Emergency Fund Minimum
              </button>
            )}
            {!hasEfIdeal && (
              <button onClick={() => openCreate({ name: "Emergency Fund - Ideal", type: "emergency_fund", targetAmount: 8000 })} className="hd-badge cursor-pointer">
                + Emergency Fund Ideal
              </button>
            )}
            {!hasNetWorth && (
              <button onClick={() => openCreate({ name: "Net Worth Target", type: "net_worth", targetAmount: 100000 })} className="hd-badge cursor-pointer">
                + Net Worth Target
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="hd-divider-dashed">
              <th className="pb-3 pt-2">Name</th>
              <th className="pb-3 pt-2">Type</th>
              <th className="pb-3 pt-2 text-right">Target</th>
              <th className="pb-3 pt-2 text-right">Current</th>
              <th className="pb-3 pt-2"></th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center" style={{ opacity: 0.6 }}>No goals created yet.</td>
              </tr>
            ) : (
              goals.map((g) => (
                <tr key={g.id} className="hd-divider-dashed">
                  <td className="py-3 font-bold">{g.name}</td>
                  <td className="py-3 capitalize">{g.type.replace("_", " ")}</td>
                  <td className="py-3 text-right">${Number(g.targetAmount).toLocaleString("en-CA")}</td>
                  <td className="py-3 text-right" style={{ opacity: 0.7 }}>${Number(g.currentAmount).toLocaleString("en-CA")}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => openEdit(g)} className="cursor-pointer hover:opacity-70">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="hd-card w-full max-w-md p-6 -rotate-1" style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}>
            <h4 className="text-2xl mb-4">{editingId ? "Edit Goal" : "New Goal"}</h4>

            {error && (
              <div className="mb-4 text-sm px-3 py-2" style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)", background: "var(--postit)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className={labelClass}>Name</label>
                <input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={form.type ?? "custom"}
                    onChange={(e) => setForm({ ...form, type: e.target.value as GoalType })}
                    className={inputClass}
                  >
                    {GOAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.targetAmount ?? 0}
                    onChange={(e) => setForm({ ...form, targetAmount: parseFloat(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="hd-btn flex-1 py-2.5">
                  {submitting ? "Saving..." : "Save Goal"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="hd-btn hd-btn--secondary px-4 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
