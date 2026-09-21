"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();

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

        <div className="bg-white rounded-3xl shadow-xl border border-line p-8 text-center">
          <h2 className="font-display font-semibold text-lg mb-3">No email link needed</h2>
          <p className="text-sm text-muted mb-6">
            This shop has no email system for sending reset links. If you already know your password
            and simply want to change it, use the{" "}
            <Link href="/admin/change-password" className="text-blush hover:text-gold font-medium">
              Change Password
            </Link>{" "}
            page after signing in.
          </p>
          <p className="text-sm bg-cream rounded-xl p-4 text-ink">
            If you have forgotten your password completely and are locked out, use the{" "}
            <span className="font-semibold">Forgot Password</span> reset provided by your hosting setup,
            or contact your server administrator to restore the admin password.
          </p>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => router.push("/admin")}
              className="w-full py-3.5 rounded-xl bg-blush hover:bg-blush-deep text-white font-semibold transition-colors"
            >
              Back to Sign In
            </button>
            <Link
              href="/admin/change-password"
              className="w-full py-3.5 rounded-xl border border-line hover:border-blush font-medium transition-colors"
            >
              Change Password
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