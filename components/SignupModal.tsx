"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiFetch } from "../services/api";

export default function SignupModal() {
  const router = useRouter();
  const showSignupModal = useAuthStore((state) => state.showSignupModal);
  const loginStore = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  if (!showSignupModal) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const mockGoogleToken = "mock_google_id_token_" + Math.random().toString(36).substring(2, 10);
      const response = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ token: mockGoogleToken }),
      });

      if (response.ok) {
        const result = await response.json();
        loginStore(result.user, result.access_token, result.refresh_token);
        // Page state will auto-update because of Zustand auth listener
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Heavy blur overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />

      {/* Modal box */}
      <div className="w-full max-w-md glass-panel-glow border border-indigo-500/30 rounded-2xl p-8 bg-[#0f111a]/90 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
          <Lock className="w-8 h-8 text-indigo-400" />
        </div>

        <h3 className="text-2xl font-extrabold text-white">Prompt Limit Reached</h3>
        
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          You have used exactly **5 free guest prompts**. To continue troubleshooting with our AI Support, please register or log in.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/signup"
            className="w-full py-3 px-4 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/15"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/login"
            className="w-full py-3 px-4 block rounded-lg font-semibold border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300 transition-all text-sm cursor-pointer"
          >
            Sign In to Existing Account
          </Link>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/80"></div></div>
          <span className="relative px-3 bg-[#0f111a] text-xs font-semibold text-slate-500 uppercase tracking-wider">or sign in with</span>
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
    </div>
  );
}
