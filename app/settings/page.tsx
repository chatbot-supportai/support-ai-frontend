"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  User, 
  ArrowLeft, 
  LayoutDashboard,
  Settings,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Volume2
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  
  const [streaming, setStreaming] = useState(true);
  const [model, setModel] = useState("gpt-4o");
  const [sound, setSound] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0f] text-slate-400 text-sm">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-900 bg-[#090a0f]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2 text-indigo-400 font-bold text-lg hover:opacity-95 transition-all">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span>SUPPORTAI <span className="text-slate-400 text-xs font-normal">CENTRAL</span></span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <Link href="/chat" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chat</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="grow max-w-7xl w-full mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="glass-panel p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role} Account</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-3 border-t border-slate-900 text-sm">
              <Link href="/dashboard" className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center gap-2.5 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </Link>
              <Link href="/profile" className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center gap-2.5 transition-colors">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <Link href="/settings" className="px-3 py-2 rounded-lg bg-indigo-950/30 text-indigo-300 font-semibold flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Account Settings</span>
              </Link>
              <button 
                onClick={() => { logout(); router.push("/"); }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Settings Area */}
        <main className="grow space-y-8 max-w-2xl">
          <div>
            <h1 className="text-3xl font-extrabold text-white">System Settings</h1>
            <p className="text-slate-400 text-sm mt-1">Manage application UI layouts and default generation behaviors.</p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-slate-900 bg-slate-950/20 space-y-8">
            
            {/* Toggle group 1 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Real-time Chat Streaming</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Generate AI response tokens dynamically instead of waiting for full paragraphs.</p>
              </div>
              <button onClick={() => setStreaming(!streaming)} className="text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer">
                {streaming ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12" />}
              </button>
            </div>

            {/* Selector group 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-900/60">
              <h3 className="text-sm font-bold text-white">Preferred AI Engine Model</h3>
              <p className="text-xs text-slate-500">Pick which GPT generation model is used for resolving support conversations.</p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  onClick={() => setModel("gpt-4o")}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    model === "gpt-4o"
                      ? "border-indigo-600 bg-indigo-950/20 text-indigo-300"
                      : "border-slate-800 hover:border-slate-700 bg-slate-950/30 text-slate-400"
                  }`}
                >
                  <p className="text-xs font-bold">GPT-4o (Recommended)</p>
                  <p className="text-[10px] mt-1 opacity-70">Highest reasoning quality and speedy execution.</p>
                </button>

                <button
                  onClick={() => setModel("gpt-3.5-turbo")}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    model === "gpt-3.5-turbo"
                      ? "border-indigo-600 bg-indigo-950/20 text-indigo-300"
                      : "border-slate-800 hover:border-slate-700 bg-slate-950/30 text-slate-400"
                  }`}
                >
                  <p className="text-xs font-bold">GPT-3.5 Turbo</p>
                  <p className="text-[10px] mt-1 opacity-70">Highly efficient option suited for basic queries.</p>
                </button>
              </div>
            </div>

            {/* Toggle group 3 */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-900/60">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>UI Audio Feedback</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Play short notification tones when response finishes generating.</p>
              </div>
              <button onClick={() => setSound(!sound)} className="text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer">
                {sound ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12" />}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
