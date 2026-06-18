import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Conversation, Message } from "../types";

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isGenerating: boolean;
  abortController: AbortController | null;
  sidebarOpen: boolean;

  // Actions
  setConversations: (convs: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  /**
   * Immediately appends the completed AI response to local state after
   * streaming finishes — avoids a blank flash before the DB refetch completes.
   */
  appendAssistantMessage: (content: string, conversationId: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  setSidebarOpen: (open: boolean) => void;
  stopGeneration: () => void;
  clearChat: () => void;
  /**
   * Full reset — call on logout so no messages leak to the next user session.
   */
  resetForUser: () => void;
}

/**
 * Returns a user-scoped localStorage key so each account has its own
 * persisted currentConversationId. Guests fall back to a shared guest key.
 *
 * Called lazily at runtime so it always reads the latest auth state without
 * creating a circular import with authStore.
 */
function getUserStorageKey(): string {
  if (typeof window === "undefined") return "chat-store-ssr";
  try {
    const raw = localStorage.getItem("glimmora-auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      const userId = parsed?.state?.user?._id;
      if (userId) return `chat-store-user-${userId}`;
    }
  } catch {
    // ignore parse errors
  }
  return "chat-store-guest";
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      isGenerating: false,
      abortController: null,
      sidebarOpen: true,

      setConversations: (conversations) => set({ conversations }),

      setCurrentConversationId: (currentConversationId) =>
        set({ currentConversationId }),

      setMessages: (messages) => set({ messages }),

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      appendAssistantMessage: (content, conversationId) => {
        const tempMsg: Message = {
          _id: "local-assistant-" + Date.now(),
          conversation_id: conversationId,
          role: "assistant",
          content,
          token_usage: 0,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ messages: [...state.messages, tempMsg] }));
      },

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setAbortController: (abortController) => set({ abortController }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      stopGeneration: () => {
        const controller = get().abortController;
        if (controller) controller.abort();
        set({ isGenerating: false, abortController: null });
      },

      clearChat: () =>
        set({
          currentConversationId: null,
          messages: [],
          isGenerating: false,
          abortController: null,
        }),

      resetForUser: () =>
        set({
          currentConversationId: null,
          messages: [],
          conversations: [],
          isGenerating: false,
          abortController: null,
        }),
    }),
    {
      name: getUserStorageKey(),
      storage: createJSONStorage(() => ({
        // Use a dynamic key so each user account is isolated in localStorage.
        // We override getItem/setItem/removeItem to re-evaluate the key on
        // every call, which means a login → logout → login cycle always picks
        // up the correct user's data without a page reload.
        getItem: (name) => {
          const key = getUserStorageKey();
          return localStorage.getItem(key) ?? null;
        },
        setItem: (name, value) => {
          const key = getUserStorageKey();
          localStorage.setItem(key, value);
        },
        removeItem: (name) => {
          const key = getUserStorageKey();
          localStorage.removeItem(key);
        },
      })),
      // Only persist lightweight navigation state, never in-flight content.
      partialize: (state) => ({
        currentConversationId: state.currentConversationId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
