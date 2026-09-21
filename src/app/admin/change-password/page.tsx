"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/check")
      .then((res) => {
        if (!res.ok) router.push("/admin");
      })
      .catch(() => router.push("/admin"));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessageType("success");
        setMessage("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to change password");
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <path d="M12 15v3" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-3xl text-ink">Change Password</h1>
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
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                placeholder="Enter current password"
                required
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                placeholder="Repeat new password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blush hover:bg-blush-deep text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Update Password"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/admin/dashboard" className="text-xs text-blush hover:text-gold transition-colors">
              ← Back to Dashboard
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