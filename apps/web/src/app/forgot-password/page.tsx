"use client";

import { useState } from "react";
import { authClient } from "../../lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: resetError } = await authClient.forgetPassword({
      email,
      redirectTo: "/reset-password",
    });

    if (resetError) {
      setError(resetError.message || "Failed to send reset link.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm">
        <div className="hd-decoration-tack" />
        <form
          onSubmit={handleSubmit}
          className="hd-card relative w-full p-8 space-y-5 rotate-[1deg]"
          style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}
        >
          <div className="text-center mb-2">
            <h1 className="hd-wavy-underline text-3xl">Reset Password</h1>
            <p className="text-lg mt-2">Enter your email to get a reset link.</p>
          </div>

          {error && (
            <div
              className="text-base px-3 py-2 rotate-[-0.5deg]"
              style={{ background: "#fff9c4", border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
            >
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div
                className="text-base px-3 py-4 rotate-[0.5deg] text-green-800"
                style={{ background: "#e8f5e9", border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
              >
                Reset link sent! Please check your email (or the console during local dev).
              </div>
              <a href="/login" className="hd-btn w-full py-3 text-xl block text-center mt-4">
                Back to Login
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-lg mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="hd-input px-3 py-2 text-lg w-full"
                />
              </div>

              <button type="submit" disabled={submitting} className="hd-btn w-full py-3 text-xl">
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-sm text-center mt-4">
                Remember your password?{" "}
                <a href="/login" className="underline" style={{ color: "var(--accent-2)" }}>
                  Sign in
                </a>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
