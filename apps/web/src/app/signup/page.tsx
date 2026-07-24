"use client";

import { useState } from "react";
import { authClient } from "../../lib/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Better Auth's emailAndPassword.autoSignIn signs the user in immediately after
    // signUp.email succeeds, so no separate login call is needed (unlike the old
    // NestJS flow, which required a manual login POST right after register).
    const { error: signUpError } = await authClient.signUp.email({ email, password, name });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      setError(signUpError.message || `Error details: ${JSON.stringify(signUpError)}`);
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
          className="hd-card relative w-full p-8 space-y-5 rotate-1"
          style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}
        >
          <div className="text-center mb-2 flex flex-col items-center justify-center">
            <img src="/logo.png" alt="MapleWealth Logo" className="w-32 h-32 object-contain mb-1" />
            <p className="text-lg">Create your money notebook.</p>
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
            <label className="block text-lg mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="hd-input px-3 py-2 text-lg"
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hd-input px-3 py-2 text-lg"
            />
            <p className="text-sm mt-1" style={{ opacity: 0.7 }}>At least 8 characters.</p>
          </div>

          <button type="submit" disabled={submitting} className="hd-btn w-full py-3 text-xl">
            {submitting ? "Creating account..." : "Create Account!"}
          </button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <a href="/login" className="underline" style={{ color: "var(--accent-2)" }}>
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
