export interface User {
  _id: string;
  name: string;
  email: string;
  provider: "credentials" | "google";
  role: "user" | "admin";
  prompts_used: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  _id: string;
  title: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  _id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  token_usage: number;
  created_at: string;
}

export interface UserStats {
  total_prompts: number;
  total_conversations: number;
  last_activity?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  guestSessionId: string | null;
  guestPromptsUsed: number;
}
