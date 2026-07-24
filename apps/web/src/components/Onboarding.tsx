"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";
import { GoalType } from "../types/dashboard.types";
import { Sparkles, ArrowRight, ShieldCheck, Target, LineChart, AlertCircle } from "lucide-react";

interface OnboardingProps {
  onCompleted: () => void;
}

export function Onboarding({ onCompleted }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [age, setAge] = useState("");
  const [annualSalary, setAnnualSalary] = useState("");
  const [monthlyTakeHome, setMonthlyTakeHome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState<GoalType | "debt">("emergency_fund");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(age) < 18 || Number(age) > 120) {
      setError("Please enter a valid age between 18 and 120.");
      return;
    }
    if (Number(annualSalary) <= 0 || Number(monthlyTakeHome) <= 0 || Number(monthlyExpenses) <= 0) {
      setError("Please fill in all financial values with positive numbers.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Create/Save the Financial Profile
      const profileRes = await apiFetch("/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(age),
          annualSalary: Number(annualSalary),
          monthlyTakeHome: Number(monthlyTakeHome),
          monthlyExpenses: Number(monthlyExpenses),
          // Set a default net worth target of $100K or 5x salary
          targetNetWorth: Math.max(100000, Number(annualSalary) * 5),
        }),
      });

      if (!profileRes.ok) {
        throw new Error("Failed to create financial profile");
      }

      // 2. Create the Primary Goal based on user's focus
      let goalPayload = {
        name: "Emergency Shield Buffer",
        type: "emergency_fund" as GoalType,
        targetAmount: Math.max(5000, Number(monthlyExpenses) * 3), // 3 months of expenses minimum
        priority: 1,
      };

      if (primaryFocus === "home") {
        goalPayload = {
          name: "First Home Down Payment",
          type: "home" as GoalType,
          targetAmount: 40000, // standard FHSA lifetime room
          priority: 1,
        };
      } else if (primaryFocus === "investment") {
        goalPayload = {
          name: "Freedom Portfolio Target",
          type: "investment" as GoalType,
          targetAmount: Math.max(100000, Number(annualSalary) * 3),
          priority: 1,
        };
      } else if (primaryFocus === "debt") {
        goalPayload = {
          name: "Complete Debt Freedom",
          type: "custom" as GoalType,
          targetAmount: 10000,
          priority: 1,
        };
      }

      const goalRes = await apiFetch("/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalPayload),
      });

      if (!goalRes.ok) {
        throw new Error("Failed to create initial goal");
      }

      // 3. Mark completed and refetch data
      onCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdfbf7]/90 p-4 overflow-y-auto">
      <div 
        className="hd-card w-full max-w-2xl p-8 rotate-1 flex flex-col justify-between relative bg-white"
        style={{ boxShadow: "12px 12px 0px 0px var(--border)", minHeight: "500px" }}
      >
        <div className="hd-decoration-tape" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b-2 border-dashed border-neutral-200 pb-4">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "50%" }}
          >
            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: "var(--accent-2)" }} />
          </div>
          <div>
            <h2 className="text-3xl">MapleWealth Onboarding</h2>
            <p className="text-xs text-neutral-500">Configure your Canadian wealth optimization profile in 2 quick steps.</p>
          </div>
        </div>

        {error && (
          <div 
            className="mb-6 p-4 rounded text-sm flex items-center gap-2 -rotate-1"
            style={{ border: "2px dashed var(--accent)", background: "#fff5f5" }}
          >
            <AlertCircle className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 mb-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <h3 className="text-xl mb-4 font-bold text-[var(--accent-2)]">Step 1: Your Baseline Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block font-bold mb-1">Your Age</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="hd-input p-3"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Used to calculate TFSA space accumulation.</span>
                </div>

                <div>
                  <label className="block font-bold mb-1">Gross Annual Salary (CAD)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 85000"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    className="hd-input p-3"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Used to estimate marginal tax brackets & RRSP room.</span>
                </div>

                <div>
                  <label className="block font-bold mb-1">Monthly Take-Home Pay (CAD)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5200"
                    value={monthlyTakeHome}
                    onChange={(e) => setMonthlyTakeHome(e.target.value)}
                    className="hd-input p-3"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Your actual net pay deposited in your account.</span>
                </div>

                <div>
                  <label className="block font-bold mb-1">Current Monthly Expenses (CAD)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3400"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    className="hd-input p-3"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Rent, bills, food, and other baseline outlays.</span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="hd-btn px-6 py-3 flex items-center gap-2 cursor-pointer">
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl mb-2 font-bold text-[var(--accent-2)]">Step 2: Choose Your Primary Focus</h3>
              <p className="text-sm text-neutral-600 mb-6">Select your primary financial milestone. We will automatically generate goals and customize your command center tiles based on this focus.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPrimaryFocus("emergency_fund")}
                  className={`p-5 hd-card cursor-pointer flex gap-4 text-left transition-all ${
                    primaryFocus === "emergency_fund" ? "scale-[1.02]" : "opacity-75 hover:opacity-100"
                  }`}
                  style={primaryFocus === "emergency_fund" ? { background: "var(--postit)" } : {}}
                >
                  <ShieldCheck className="w-8 h-8 shrink-0 text-[var(--accent)]" />
                  <div>
                    <h4 className="font-bold text-lg">Emergency Shield</h4>
                    <p className="text-xs mt-1 text-neutral-600">Secure 3-6 months of liquid cash reserves before making heavy investments.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrimaryFocus("home")}
                  className={`p-5 hd-card cursor-pointer flex gap-4 text-left transition-all ${
                    primaryFocus === "home" ? "scale-[1.02]" : "opacity-75 hover:opacity-100"
                  }`}
                  style={primaryFocus === "home" ? { background: "var(--postit)" } : {}}
                >
                  <Target className="w-8 h-8 shrink-0 text-[var(--accent-2)]" />
                  <div>
                    <h4 className="font-bold text-lg">First-Home Purchase</h4>
                    <p className="text-xs mt-1 text-neutral-600">Prioritize maximizing tax-free FHSA and TFSA accounts for a downpayment.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrimaryFocus("investment")}
                  className={`p-5 hd-card cursor-pointer flex gap-4 text-left transition-all ${
                    primaryFocus === "investment" ? "scale-[1.02]" : "opacity-75 hover:opacity-100"
                  }`}
                  style={primaryFocus === "investment" ? { background: "var(--postit)" } : {}}
                >
                  <LineChart className="w-8 h-8 shrink-0 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-lg">General Wealth Building</h4>
                    <p className="text-xs mt-1 text-neutral-600">Focus on broad-market ETFs, long-term compounding, and tax optimization.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrimaryFocus("debt")}
                  className={`p-5 hd-card cursor-pointer flex gap-4 text-left transition-all ${
                    primaryFocus === "debt" ? "scale-[1.02]" : "opacity-75 hover:opacity-100"
                  }`}
                  style={primaryFocus === "debt" ? { background: "var(--postit)" } : {}}
                >
                  <AlertCircle className="w-8 h-8 shrink-0 text-red-600" />
                  <div>
                    <h4 className="font-bold text-lg">Debt Elimination</h4>
                    <p className="text-xs mt-1 text-neutral-600">Focus on paid down high-interest liabilities for a guaranteed return.</p>
                  </div>
                </button>
              </div>

              <div className="flex justify-between pt-6 border-t border-dashed border-neutral-200 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hd-btn hd-btn--secondary px-6 py-3 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit}
                  className="hd-btn px-8 py-3 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Finalizing Plan..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
