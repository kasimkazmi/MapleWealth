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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm">
        <div className="hd-decoration-tack" />
        <form
          onSubmit={handleSubmit}
          className="hd-card relative w-full p-8 space-y-5 rotate-[-1deg]"
          style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}
        >
          <div className="text-center mb-2">
            <h1 className="hd-wavy-underline text-4xl">MapleWealth</h1>
            <p className="text-lg mt-2">Sign in to your money notebook.</p>
          </div>

          {error && (
            <div
              className="text-base px-3 py-2 rotate-[0.5deg]"
              style={{ background: "#fff9c4", border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-lg mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hd-input px-3 py-2 text-lg"
            />
          </div>

          <div>
            <label className="block text-lg mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hd-input px-3 py-2 text-lg"
            />
          </div>

          <button type="submit" disabled={submitting} className="hd-btn w-full py-3 text-xl">
            {submitting ? "Signing in..." : "Sign In!"}
          </button>

          <p className="text-sm text-center" style={{ opacity: 0.7 }}>
            Signing in here will sign you out of any other active session on this account.
          </p>

          <p className="text-sm text-center">
            No account yet?{" "}
            <a href="/signup" className="underline" style={{ color: "var(--accent-2)" }}>
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
