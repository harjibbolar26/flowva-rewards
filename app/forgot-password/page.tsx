"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: userExists, error: checkError } = await supabase.rpc(
        "check_email_exists",
        {
          user_email: email,
        }
      );

      if (checkError) {
        // If RPC doesn't exist, fall back to just sending the reset email
        console.warn("check_email_exists RPC not found, proceeding with reset");
      } else if (!userExists) {
        toast.error(
          "No account exists with this email address. Please check and try again."
        );
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Password reset link sent!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-500 flex items-center justify-center px-4 text-black">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>

          <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
            Forgot Password?
          </h1>
          <p className="text-gray-600 text-center mb-8 text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {!submitted ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
                <p className="font-medium">Check your email</p>
                <p className="text-sm mt-1">
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
