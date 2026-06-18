import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  guestSessionId: string | null;
  guestPromptsUsed: number;
  showSignupModal: boolean;
  
  // Actions
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  initializeSession: () => string;
  setGuestPromptsUsed: (count: number) => void;
  setShowSignupModal: (show: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      guestSessionId: null,
      guestPromptsUsed: 0,
      showSignupModal: false,

      login: (user, token, refreshToken) => set({
        user,
        token,
        refreshToken,
        // When logging in, we can hide the signup modal
        showSignupModal: false,
      }),

      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        // Preserve guestSessionId on logout so they can chat as guests again if needed
        showSignupModal: false
      }),

      initializeSession: () => {
        let sid = get().guestSessionId;
        if (!sid) {
          sid = typeof window !== "undefined" && window.crypto?.randomUUID 
            ? window.crypto.randomUUID() 
            : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          set({ guestSessionId: sid, guestPromptsUsed: 0 });
        }
        return sid;
      },

      setGuestPromptsUsed: (count) => set({ 
        guestPromptsUsed: count,
        showSignupModal: count >= 5
      }),

      setShowSignupModal: (show) => set({ showSignupModal: show }),

      updateUser: (updatedFields) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedFields } : null
      }))
    }),
    {
      name: "glimmora-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        guestSessionId: state.guestSessionId,
        guestPromptsUsed: state.guestPromptsUsed,
      }),
    }
  )
);
