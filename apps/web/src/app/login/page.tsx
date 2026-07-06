"use client";

import { useState } from "react";
import { API_URL, setToken, request } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await request<{ token: string }>(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    setToken(result.data.token);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060913] px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-panel w-full max-w-sm p-8 space-y-5"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white">MapleWealth</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your financial command center.</p>
        </div>

        {error && (
          <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0c1122] border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0c1122] border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-semibold transition-all cursor-pointer"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Signing in here will sign you out of any other active session on this account.
        </p>

        <p className="text-xs text-slate-500 text-center">
          No account yet?{" "}
          <a href="/signup" className="text-emerald-400 hover:underline">
            Create one
          </a>
        </p>
      </form>
    </div>
  );
}
