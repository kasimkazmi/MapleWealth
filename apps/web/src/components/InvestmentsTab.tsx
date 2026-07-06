"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { LineChart, Plus, X } from "lucide-react";

const DEFAULT_POLICY = ["XEQT", "VEQT", "VGRO"];

export function InvestmentsTab() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/investment-policy");
      if (res.ok) {
        setSymbols(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount, see useDashboard.ts
    void fetchPolicy();
  }, [fetchPolicy]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/investment-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: newSymbol.trim().toUpperCase() }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add symbol");
      }
      setSymbols(await res.json());
      setNewSymbol("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add symbol");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    setError(null);
    try {
      const res = await apiFetch(`/investment-policy/${encodeURIComponent(symbol)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove symbol");
      }
      setSymbols(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove symbol");
    }
  };

  return (
    <div className="space-y-8">
      <div className="hd-card p-6">
        <h3 className="text-2xl mb-2 flex items-center gap-2">
          <LineChart className="w-5 h-5" style={{ color: "var(--accent-2)" }} /> Investment Policy
        </h3>
        <p className="text-sm mb-6" style={{ opacity: 0.7 }}>
          The planning engine only flags holdings outside this list as speculative. Define your own approved investments here.
        </p>

        {error && (
          <div className="mb-4 text-sm px-3 py-2" style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)", background: "var(--postit)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-sm" style={{ opacity: 0.6 }}>Loading...</div>
        ) : (
          <>
            {symbols.length === 0 ? (
              <div
                className="mb-6 p-4 text-sm"
                style={{ border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)", opacity: 0.85 }}
              >
                No custom policy set — using the built-in default: <span className="font-bold">{DEFAULT_POLICY.join(", ")}</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6">
                {symbols.map((symbol) => (
                  <span key={symbol} className="hd-badge gap-2 text-sm font-bold">
                    {symbol}
                    <button onClick={() => handleRemove(symbol)} className="cursor-pointer hover:opacity-60">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <form onSubmit={handleAdd} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. VFV"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="hd-input flex-1 p-2.5"
              />
              <button type="submit" disabled={submitting} className="hd-btn px-5 py-2.5">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
