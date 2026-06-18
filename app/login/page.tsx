"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { apiFetch } from "../../services/api";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormFields = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormFields) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Invalid email or password");
      }

      const result = await response.json();
      // Store tokens and user info
      loginStore(result.user, result.access_token, result.refresh_token);
      
      // Redirect to Chat
      router.push("/chat");
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock Google Login token verification
      // For MVP, we submit a mock ID token. The backend verifies Google tokens if configured,
      // but under fallback/placeholder configs it registers/authenticates the user smoothly.
      const mockGoogleToken = "mock_google_id_token_" + Math.random().toString(36).substring(2, 10);
      
      const response = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ token: mockGoogleToken }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Google authentication failed");
      }

      const result = await response.json();
      loginStore(result.user, result.access_token, result.refresh_token);
      router.push("/chat");
    } catch (err) {
      setError((err as Error).message || "Google OAuth failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#090a0f]">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full radial-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full radial-glow-accent pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 font-bold text-2xl tracking-wide">
            <Shield className="w-8 h-8 text-indigo-500" />
            <span>SUPPORTAI <span className="text-slate-400 text-sm font-normal px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-950/20">CENTRAL</span></span>
          </Link>
          <h2 className="text-2xl font-extrabold mt-4 text-white">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to your centralized support panel</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-slate-800 bg-[#0f111a]/80 backdrop-blur-md">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                <Link href="#" className="text-xs text-indigo-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all text-sm shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <span className="relative px-3 bg-[#0f111a] text-xs font-semibold text-slate-500 uppercase tracking-wider">or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-300 font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.16-3.16C17.47 1.81 14.94 1 12 1 7.24 1 3.22 3.73 1.34 7.69l3.71 2.88c.88-2.65 3.38-4.53 6.95-4.53z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.71 2.88c2.17-2 3.68-4.94 3.68-8.55z" />
              <path fill="#FBBC05" d="M5.05 10.57c-.22-.67-.35-1.39-.35-2.13S4.83 7 5.05 6.33L1.34 3.45C.49 5.15 0 7.03 0 9s.49 3.85 1.34 5.55l3.71-2.88z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.88c-1.12.75-2.55 1.2-4.25 1.2-3.57 0-6.07-1.88-6.95-4.53l-3.71 2.88C3.22 20.27 7.24 23 12 23z" />
            </svg>
            <span>Google Workspace</span>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:underline font-semibold">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
