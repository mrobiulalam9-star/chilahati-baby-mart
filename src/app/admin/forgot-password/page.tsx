"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessageType("success");
        setMessage(data.message || "If this email matches your admin account, a message has been sent.");
        setEmail("");
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to send reset email");
      }
    } catch {
      setMessageType("error");
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-paper to-blush/10 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-blush flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-3xl text-ink">Reset Password</h1>
          <p className="text-muted mt-2">Chilahati Ladies & Baby Mart</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-line p-8">
          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                placeholder="Enter your admin email"
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blush hover:bg-blush-deep text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Recovery Email"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/admin" className="text-xs text-blush hover:text-gold transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          <Link href="/" className="hover:text-blush transition-colors">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}