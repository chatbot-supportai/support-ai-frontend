"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  User, 
  LogOut,
  LayoutDashboard,
  Check,
  X,
  PanelLeftClose
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { apiFetch } from "../services/api";
import { Conversation } from "../types";

export default function Sidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, guestPromptsUsed, logout, guestSessionId } = useAuthStore();
  const { currentConversationId, setCurrentConversationId, clearChat, setSidebarOpen, resetForUser } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Fetch history list
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations", user?._id, guestSessionId],
    queryFn: async () => {
      const res = await apiFetch("/chat/history");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: typeof window !== "undefined"
  });

  // Rename Mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await apiFetch(`/conversation/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setEditingId(null);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/conversation/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (currentConversationId === deletedId) {
        clearChat();
      }
    }
  });

  const handleStartNewChat = () => {
    clearChat();
    router.push("/chat");
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      renameMutation.mutate({ id, title: editTitle.trim() });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat conversation?")) {
      deleteMutation.mutate(id);
    }
  };

  const startEditing = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  // Filter conversations
  const filteredConvs = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date buckets
  const getGroupedConversations = (convs: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: { [key: string]: Conversation[] } = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Older": []
    };

    convs.forEach((conv) => {
      const updatedDate = new Date(conv.updated_at);
      if (updatedDate >= today) {
        groups["Today"].push(conv);
      } else if (updatedDate >= yesterday) {
        groups["Yesterday"].push(conv);
      } else if (updatedDate >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(conv);
      } else {
        groups["Older"].push(conv);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  };

  const groupedConversations = getGroupedConversations(filteredConvs);

  return (
    <aside className="w-[260px] bg-[#171717] flex flex-col h-full shrink-0 select-none border-r border-white/5">
      {/* Header with collapsible trigger and new chat */}
      <div className="h-14 flex items-center justify-between px-3 text-slate-200 shrink-0">
        <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider pl-2">SupportAI</span>
        <div className="flex items-center gap-0.5">
          <button 
            onClick={handleStartNewChat}
            className="p-2 rounded-lg hover:bg-[#212121] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="New chat"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-[#212121] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Search Input - Cleaned up to match ChatGPT style */}
      <div className="px-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border-0 bg-[#212121] text-slate-300 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#ececec]/10"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List - Grouped by Date */}
      <div className="grow overflow-y-auto px-2 space-y-4 scrollbar-thin">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-slate-500">Loading history...</div>
        ) : filteredConvs.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-600">No chats found</div>
        ) : (
          groupedConversations.map(([groupName, items]) => (
            <div key={groupName} className="space-y-0.5">
              <h4 className="text-[10px] font-semibold text-slate-500 px-3.5 pt-2 pb-1 select-none">
                {groupName}
              </h4>
              {items.map((conv) => {
                const isActive = currentConversationId === conv._id;
                const isEditing = editingId === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => !isEditing && setCurrentConversationId(conv._id)}
                    className={`group px-3 py-2 rounded-lg flex items-center justify-between text-sm cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#212121] text-[#ececec] font-medium" 
                        : "text-slate-300 hover:bg-[#212121]/60 hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 grow overflow-hidden">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-[#ececec]" : "text-slate-500"}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          className="bg-[#2f2f2f] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white grow outline-none focus:border-white/20"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit(conv._id)}
                          autoFocus
                        />
                      ) : (
                        <span className="truncate text-xs leading-normal">{conv.title}</span>
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRenameSubmit(conv._id); }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-[#2f2f2f]"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#2f2f2f]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startEditing(e, conv)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f]"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, conv._id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#2f2f2f]"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Account Info Footer */}
      <div className="border-t border-white/5 bg-[#171717] p-3 shrink-0">
        {user ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs select-none">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="grow overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-center">
              <Link
                href="/dashboard"
                className="p-1.5 rounded hover:bg-[#212121] text-slate-400 hover:text-[#ececec] flex flex-col items-center gap-0.5 cursor-pointer"
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[9px]">Dashboard</span>
              </Link>
              <Link
                href="/profile"
                className="p-1.5 rounded hover:bg-[#212121] text-slate-400 hover:text-[#ececec] flex flex-col items-center gap-0.5 cursor-pointer"
                title="Profile"
              >
                <User className="w-4 h-4" />
                <span className="text-[9px]">Profile</span>
              </Link>
              <button
                onClick={() => { resetForUser(); logout(); router.push("/"); }}
                className="p-1.5 rounded hover:bg-[#212121] text-slate-400 hover:text-red-400 flex flex-col items-center gap-0.5 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[9px]">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Guest Mode</span>
              <span className="text-emerald-500">
                {process.env.NEXT_PUBLIC_ENV === "development" || process.env.NODE_ENV === "development" 
                  ? `${guestPromptsUsed} prompts (Unlimited Dev)` 
                  : `${guestPromptsUsed}/5 prompts`}
              </span>
            </div>
            
            <div className="w-full bg-[#212121] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${process.env.NEXT_PUBLIC_ENV === "development" || process.env.NODE_ENV === "development" ? 0 : Math.min(100, (guestPromptsUsed / 5) * 100)}%` 
                }}
              />
            </div>

            <Link
              href="/signup"
              className="block w-full py-2 text-center text-xs rounded-lg bg-[#2f2f2f] hover:bg-[#3f3f3f] border border-white/10 font-bold text-white transition-all cursor-pointer"
            >
              Sign Up for Unlimited
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
