import { create } from "zustand";
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
  setIsGenerating: (generating: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  setSidebarOpen: (open: boolean) => void;
  stopGeneration: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  isGenerating: false,
  abortController: null,
  sidebarOpen: true,

  setConversations: (conversations) => set({ conversations }),
  setCurrentConversationId: (currentConversationId) => set({ currentConversationId }),
  setMessages: (messages) => set({ messages }),
  
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, msg] 
  })),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setAbortController: (abortController) => set({ abortController }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  stopGeneration: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
    }
    set({ isGenerating: false, abortController: null });
  },

  clearChat: () => set({
    currentConversationId: null,
    messages: [],
    isGenerating: false,
    abortController: null
  })
}));
