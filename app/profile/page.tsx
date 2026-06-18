"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  LayoutDashboard,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { apiFetch } from "../../services/api";

const profileSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().optional().or(zod.literal("")),
});

type ProfileFormFields = zod.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout, updateUser } = useAuthStore();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormFields>({
    resolver: zodResolver(profileSchema),
  });

  // Pre-populate fields on mount
  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormFields) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      // Formulate update payload (only include password if it is set)
      const payload: Record<string, string> = {
        name: data.name,
        email: data.email,
      };
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }

      const response = await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update profile");
      }

      const result = await response.json();
      
      // Update local storage store
      updateUser(result);
      setSuccess("Profile settings updated successfully!");
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
              <Link href="/profile" className="px-3 py-2 rounded-lg bg-indigo-950/30 text-indigo-300 font-semibold flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-400" />
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

        {/* Content Box */}
        <main className="grow space-y-8 max-w-2xl">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
            <p className="text-slate-400 text-sm mt-1">Configure your personal information and login credentials.</p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-slate-900 bg-slate-950/20">
            {success && (
              <div className="flex items-center gap-2.5 p-4 mb-6 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 p-4 mb-6 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Account Login Provider</label>
                <input
                  type="text"
                  disabled
                  value={user.provider === "google" ? "Google GSuite Single Sign-On" : "Email & Password Credentials"}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed text-sm capitalize font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                    placeholder="Enter name"
                    {...register("name")}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    disabled={loading || user.provider === "google"}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 transition-all text-sm ${
                      user.provider === "google" ? "cursor-not-allowed text-slate-500" : ""
                    }`}
                    placeholder="Enter email"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {user.provider !== "google" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Change Password (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                      placeholder="Leave blank to keep current"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm flex items-center justify-center cursor-pointer shadow-md shadow-indigo-500/10 disabled:opacity-50"
              >
                {loading ? "Saving changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
