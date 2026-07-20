"use client";

import { useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setSubmitting(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (resetError) {
      setError(resetError.message || "Failed to reset password.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="hd-decoration-tack" />
      <form
        onSubmit={handleSubmit}
        className="hd-card relative w-full p-8 space-y-5 rotate-[-1deg]"
        style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}
      >
        <div className="text-center mb-2">
          <h1 className="hd-wavy-underline text-3xl">Set New Password</h1>
          <p className="text-lg mt-2">Please enter your new password below.</p>
        </div>

        {error && (
          <div
            className="text-base px-3 py-2 rotate-[0.5deg]"
            style={{ background: "#fff9c4", border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
          >
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div
              className="text-base px-3 py-4 rotate-[-0.5deg] text-green-800"
              style={{ background: "#e8f5e9", border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
            >
              Password successfully reset! You can now log in with your new password.
            </div>
            <a href="/login" className="hd-btn w-full py-3 text-xl block text-center mt-4">
              Go to Login
            </a>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-lg mb-1">New Password</label>
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

            <div>
              <label className="block text-lg mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="hd-input px-3 py-2 text-lg w-full"
              />
            </div>

            <button type="submit" disabled={submitting || !token} className="hd-btn w-full py-3 text-xl">
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
            
            {!token && (
               <p className="text-sm text-center text-red-600 mt-2">
                 Missing reset token in URL. Please use the link from your email.
               </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-xl">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
