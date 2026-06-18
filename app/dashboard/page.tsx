"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  MessageSquare, 
  Cpu, 
  Calendar, 
  ArrowLeft, 
  MessageCircle, 
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Zap,
  TrendingUp,
  Flame
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { apiFetch } from "../../services/api";
import { UserStats, Conversation } from "../../types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Fetch stats from backend
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["profile-stats", user?._id],
    queryFn: async () => {
      const res = await apiFetch("/profile/stats");
      if (!res.ok) throw new Error("Could not load stats");
      return res.json();
    },
    enabled: !!token
  });

  // Fetch recent conversations
  const { data: conversations = [], isLoading: historyLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations", user?._id],
    queryFn: async () => {
      const res = await apiFetch("/chat/history");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token
  });

  // Fetch personalized trending (user's 4 most recent conversations)
  const { data: trending = [], isLoading: trendingLoading } = useQuery<Conversation[]>({
    queryKey: ["trending", user?._id],
    queryFn: async () => {
      const res = await apiFetch("/chat/trending");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
    staleTime: 30_000,           // re-fetch every 30 s
    refetchOnWindowFocus: true,   // always fresh when user returns to tab
  });

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0f] text-slate-400 text-sm">
        Authenticating...
      </div>
    );
  }

  const formattedDate = (isoStr?: string) => {
    if (!isoStr) return "N/A";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
        
        {/* Navigation Sidebar panel */}
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
              <Link href="/dashboard" className="px-3 py-2 rounded-lg bg-indigo-950/30 text-indigo-300 font-semibold flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Dashboard Overview</span>
              </Link>
              <Link href="/profile" className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center gap-2.5 transition-colors">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <Link href="/settings" className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center gap-2.5 transition-colors">
                <Settings className="w-4 h-4" />
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

        {/* Dashboard Content area */}
        <main className="grow space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Welcome back, {user.name.split(" ")[0]} 👋</h1>
            <p className="text-slate-400 text-sm mt-1">Here&#39;s your personalized SupportAI activity hub.</p>
          </div>

          {/* Stats overview row */}
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Stat card 1 */}
            <div className="glass-panel p-6 rounded-xl border border-slate-900 bg-slate-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 radial-glow pointer-events-none" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Prompts Submitted</p>
              <p className="text-3xl font-extrabold text-white mt-2">
                {statsLoading ? "..." : stats?.total_prompts ?? 0}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unlimited tokens allocated</span>
              </div>
            </div>

            {/* Stat card 2 */}
            <div className="glass-panel p-6 rounded-xl border border-slate-900 bg-slate-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 radial-glow-accent pointer-events-none" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Conversations</p>
              <p className="text-3xl font-extrabold text-white mt-2">
                {statsLoading ? "..." : stats?.total_conversations ?? 0}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                <MessageCircle className="w-3.5 h-3.5 text-accent" />
                <span>Active escalation history</span>
              </div>
            </div>

            {/* Stat card 3 */}
            <div className="glass-panel p-6 rounded-xl border border-slate-900 bg-slate-950/20 relative overflow-hidden">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity Date</p>
              <p className="text-sm font-bold text-white mt-4 truncate">
                {statsLoading ? "..." : formattedDate(stats?.last_activity)}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Active support updates</span>
              </div>
            </div>
          </div>

          {/* ── Personalized Trending for You ──────────────────────────── */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-950/20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-white">Trending for You</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Live
                </span>
              </div>
              <span className="text-xs text-slate-500">Your 4 most recent topics</span>
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : trending.length === 0 ? (
              <div className="py-8 text-center">
                <TrendingUp className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Start chatting to see your trending topics here.</p>
                <Link href="/chat" className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-400 hover:text-indigo-300">
                  <Zap className="w-3.5 h-3.5" /> Open Chat
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trending.map((conv, idx) => {
                  const rankColors = [
                    "from-orange-500 to-amber-500",
                    "from-indigo-500 to-violet-500",
                    "from-emerald-500 to-teal-500",
                    "from-pink-500 to-rose-500",
                  ];
                  return (
                    <li
                      key={conv._id}
                      className="group relative flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-600 hover:bg-slate-800/60 transition-all cursor-pointer"
                    >
                      {/* Rank badge */}
                      <span
                        className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${rankColors[idx]} flex items-center justify-center text-[10px] font-extrabold text-white shadow`}
                      >
                        {idx + 1}
                      </span>

                      <div className="flex items-start gap-2.5 pr-8">
                        <TrendingUp className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
                          {conv.title || "Untitled Conversation"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-[10px] text-slate-500">
                          {new Date(conv.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <Link
                          href="/chat"
                          onClick={() => useChatStore.getState().setCurrentConversationId(conv._id)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 bg-indigo-950/20 hover:bg-indigo-900/30 px-2 py-0.5 rounded transition-colors"
                        >
                          Resume →
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Conversations History List */}
          <div className="glass-panel p-6 rounded-xl border border-slate-900 bg-slate-950/20 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <h2 className="text-lg font-bold text-white">Recent Support Conversations</h2>
              <Link href="/chat" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                <span>Start New Chat</span>
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
              </Link>
            </div>

            {historyLoading ? (
              <div className="py-6 text-center text-sm text-slate-500">Loading conversation history...</div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-600">
                You haven&apos;t started any support sessions yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-900/60 max-h-96 overflow-y-auto scrollbar-thin">
                {conversations.slice(0, 10).map((conv) => (
                  <div key={conv._id} className="py-3.5 flex items-center justify-between hover:bg-slate-900/10 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden pr-4">
                      <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-200 truncate">{conv.title}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">{formattedDate(conv.updated_at)}</span>
                      <Link
                        href="/chat"
                        onClick={() => {
                          // Set active conversation state in Zustand before jumping to chat
                          useChatStore.getState().setCurrentConversationId(conv._id);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-500/20 bg-indigo-950/20 px-2.5 py-1 rounded"
                      >
                        Resume
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
