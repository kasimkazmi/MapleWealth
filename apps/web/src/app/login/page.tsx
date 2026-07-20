"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "../../lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await authClient.signIn.email({ email, password });

    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setSubmitting(false);
      return;
    }

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
          <div className="text-center mb-2 flex flex-col items-center justify-center">
            <img src="/logo.png" alt="MapleWealth Logo" className="w-16 h-16 object-contain mb-4" />
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-lg">Password</label>
              <a href="/forgot-password" className="text-sm underline" style={{ color: "var(--accent-2)" }}>
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="hd-input px-3 py-2 text-lg w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
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
