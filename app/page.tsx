"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, 
  Cpu, 
  MessageSquareShare, 
  Sparkles, 
  History, 
  Gauge, 
  Zap, 
  ArrowRight,
  Database,
  Lock
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="relative min-h-screen bg-[#090a0f] text-slate-100 overflow-x-hidden">
      {/* Decorative Neon Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] -left-[200px] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-900 bg-[#090a0f]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-400 font-bold text-xl tracking-wide hover:opacity-95 transition-all">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span>SUPPORTAI <span className="text-slate-400 text-xs font-normal px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-950/20">CENTRAL</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm hover:text-indigo-400 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/chat" className="px-4 py-2 text-sm rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-500/10">
                  Enter Chat
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-500/10">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Next-Generation Centralized Escalation</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
          AI-Powered Support, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Escalated Instantly.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto mt-6 text-base md:text-lg text-slate-400 leading-relaxed">
          Our Centralized Support platform delivers fast, contextual AI resolutions for technical queries, logs prompts for deep analytics, and escalates seamlessly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/chat" className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer group">
            <span>Try Guest AI Chat</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/signup" className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40 text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Visual App Mockup */}
        <div className="mt-16 relative rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-2xl max-w-5xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
          <div className="h-64 sm:h-96 md:h-[480px] rounded-lg overflow-hidden glass-panel flex flex-col border border-slate-800/80">
            {/* Window bar */}
            <div className="h-10 border-b border-slate-900 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-slate-500 font-medium">SupportAI Chat Interface</span>
              <span className="w-6" />
            </div>
            
            {/* Interactive preview layout */}
            <div className="grow flex bg-[#0c0d14]/40 text-left text-sm p-6 overflow-hidden">
              <div className="w-1/4 border-r border-slate-900/60 hidden md:block pr-4 space-y-3">
                <div className="h-8 rounded bg-slate-900/60 w-3/4" />
                <div className="h-8 rounded bg-slate-900/30 w-full" />
                <div className="h-8 rounded bg-slate-900/30 w-5/6" />
              </div>
              <div className="grow pl-0 md:pl-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/30 shrink-0" />
                    <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/10 text-slate-300 w-3/4">
                      How can I secure my API keys using the platform parameters?
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 w-3/4">
                      To secure your credentials, store your values inside environment variables (e.g. `.env`) and load them using `BaseSettings` configurations.
                    </div>
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 shrink-0" />
                  </div>
                </div>
                <div className="h-10 rounded-lg bg-slate-950 border border-slate-900 p-2 text-slate-600 flex items-center justify-between">
                  <span>Type a message...</span>
                  <Zap className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6 border-t border-slate-950 bg-slate-950/20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Centralized support features built to scale</h2>
          <p className="text-slate-400 mt-4">Everything you need to automate help desks, monitor analytics, and maintain response quality.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/60 hover:bg-slate-950 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Streaming Chat</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Real-time chat interfaces powered by custom GPT streams. Fast, responsive, and formats complex markdown code.</p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/60 hover:bg-slate-950 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Conversation History</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Instantly access, rename, or delete past conversations. Authenticated users get unlimited chats synced across devices.</p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/60 hover:bg-slate-950 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Guest Limit Locks</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Strict anonymous constraints enforce exactly five free prompts before requesting user creation to avoid spam.</p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/60 hover:bg-slate-950 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-400 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interactive Dashboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Monitor your token consumption, total prompt logs, recent chats, and access custom profile settings.</p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/60 hover:bg-slate-950 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-pink-600/10 flex items-center justify-center text-pink-400 mb-6 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <MessageSquareShare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Google OAuth Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Sign in instantly using Google credentials. Converts guest history to your logged-in profile seamlessly.</p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/60 hover:bg-slate-950 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Celery + Redis Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Built with a production-grade asynchronous broker. Logs metrics, counts tokens, and triggers alerts in the background.</p>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">How the escalation works</h2>
          <p className="text-slate-400 mt-4">Simple, straightforward support path that guides guests and authenticated members alike.</p>
        </div>

        <div className="relative border-l border-slate-800 md:border-l-0 md:flex md:gap-8 max-w-4xl mx-auto pl-6 md:pl-0">
          {/* Step 1 */}
          <div className="relative md:flex-1 mb-12 md:mb-0">
            <div className="absolute -left-9 md:left-1/2 md:-translate-x-1/2 -top-1 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-xs text-indigo-400 font-bold">1</div>
            <h3 className="text-lg font-bold text-white md:text-center mt-6">Ask Anonymous Questions</h3>
            <p className="text-slate-400 text-sm md:text-center mt-2 leading-relaxed">Any user can navigate directly to the chat room and ask up to 5 questions without registering.</p>
          </div>

          {/* Step 2 */}
          <div className="relative md:flex-1 mb-12 md:mb-0">
            <div className="absolute -left-9 md:left-1/2 md:-translate-x-1/2 -top-1 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs text-purple-400 font-bold">2</div>
            <h3 className="text-lg font-bold text-white md:text-center mt-6">Reach Prompt Limit</h3>
            <p className="text-slate-400 text-sm md:text-center mt-2 leading-relaxed">On the 6th prompt, chat is blurred and a signup modal interrupts to prevent bypassing limits.</p>
          </div>

          {/* Step 3 */}
          <div className="relative md:flex-1">
            <div className="absolute -left-9 md:left-1/2 md:-translate-x-1/2 -top-1 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-xs text-emerald-400 font-bold">3</div>
            <h3 className="text-lg font-bold text-white md:text-center mt-6">Sign Up and Expand</h3>
            <p className="text-slate-400 text-sm md:text-center mt-2 leading-relaxed">Creating an account releases limitations and unlocks unlimited chats, dashboards, and profile metrics.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 max-w-7xl mx-auto px-6 border-t border-slate-900 bg-slate-950/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Curated membership options</h2>
          <p className="text-slate-400 mt-4">Start for free or unlock the full capability of the escalation platform.</p>
        </div>

        <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-8">
          {/* Guest plan */}
          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/40 relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Default Tier</span>
              <h3 className="text-2xl font-bold text-white mt-2">Anonymous Guest</h3>
              <p className="text-slate-400 text-sm mt-4">Try the platform instantly with no credit cards or email registrations.</p>
              
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-500 text-sm ml-2">/ forever</span>
              </div>
              
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Exactly 5 AI prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Streaming assistant response</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>No login required</span>
                </li>
              </ul>
            </div>
            
            <Link href="/chat" className="mt-8 block w-full py-3 text-center rounded-lg font-semibold border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900 transition-all cursor-pointer">
              Start Chatting
            </Link>
          </div>

          {/* Pro plan */}
          <div className="p-8 rounded-2xl border border-indigo-500/30 bg-[#0f111a]/80 relative flex flex-col justify-between shadow-xl shadow-indigo-500/5">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider">Popular</div>
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Authenticated Tier</span>
              <h3 className="text-2xl font-bold text-white mt-2">Registered User</h3>
              <p className="text-slate-400 text-sm mt-4">Save history, access dashboards, and talk to the model with no constraints.</p>
              
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 text-sm ml-2">/ requires account</span>
              </div>
              
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-indigo-300">Unlimited conversations & prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Chat history sidebar (save/rename/delete)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Interactive usage analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Custom profile settings</span>
                </li>
              </ul>
            </div>
            
            <Link href="/signup" className="mt-8 block w-full py-3 text-center rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/10 cursor-pointer">
              Register Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 SupportAI Escalation Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
