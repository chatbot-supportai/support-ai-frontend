"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus,
  Terminal, 
  Sparkles, 
  CornerDownLeft, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  StopCircle, 
  ChevronRight,
  Menu,
  X,
  Check,
  PanelLeft,
  ChevronDown,
  Paperclip,
  Mic,
  MicOff,
  ArrowUp,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import SignupModal from "../../components/SignupModal";
import Markdown from "../../components/Markdown";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { apiFetch } from "../../services/api";
import { Message } from "../../types";

const SUGGESTED_PROMPTS = [
  { text: "Help me troubleshoot a Docker memory leak", icon: Terminal, color: "text-amber-400" },
  { text: "How do I securely manage credentials in FastAPI?", icon: Sparkles, color: "text-indigo-400" },
  { text: "Explain how MongoDB Atlas indexing optimizes search speed", icon: CornerDownLeft, color: "text-emerald-400" },
  { text: "Draft an escalation response to high-severity outages", icon: AlertTriangle, color: "text-rose-400" },
];

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { user, token, guestSessionId, guestPromptsUsed, setGuestPromptsUsed, setShowSignupModal, showSignupModal } = useAuthStore();
  const { 
    currentConversationId, 
    setCurrentConversationId, 
    messages, 
    setMessages, 
    isGenerating, 
    setIsGenerating, 
    setAbortController, 
    stopGeneration,
    clearChat,
    sidebarOpen,
    setSidebarOpen,
    appendAssistantMessage
  } = useChatStore();

  const [input, setInput] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // ── Voice recording state ──────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Holds the text that was already in the textarea before recording started,
  // so we can correctly append interim results without duplicating it.
  const inputBeforeRecordRef = useRef("");
  // ──────────────────────────────────────────────────────────────────────────

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Voice recording helpers ────────────────────────────────────────────────
  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript("");
    setVoiceError(null);
    // Focus textarea so the user can edit / send immediately
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const startVoiceRecording = useCallback(() => {
    // Clear any previous error
    setVoiceError(null);

    const SpeechRecognitionCtor: { new(): SpeechRecognition } | undefined =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceError("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;   // show live preview
    recognition.continuous = true;       // keep listening until stopped
    recognition.maxAlternatives = 1;

    // Snapshot current input so we can append without duplicating
    inputBeforeRecordRef.current = input;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }

      if (finalChunk) {
        // Commit the final chunk into the main input
        setInput((prev) => {
          const base = inputBeforeRecordRef.current;
          const newText = base
            ? base + " " + finalChunk.trim()
            : finalChunk.trim();
          inputBeforeRecordRef.current = newText;
          return newText;
        });
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimChunk);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") return; // ignore silence
      if (event.error === "aborted") return;    // manual stop, not an error
      setVoiceError(`Mic error: ${event.error}`);
      stopVoiceRecording();
    };

    recognition.onend = () => {
      // Only stop state if we haven't already done so (e.g. on error)
      setIsRecording(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [input, stopVoiceRecording]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  }, [isRecording, startVoiceRecording, stopVoiceRecording]);

  // Stop recording if the user starts generating
  useEffect(() => {
    if (isGenerating && isRecording) stopVoiceRecording();
  }, [isGenerating, isRecording, stopVoiceRecording]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent]);

  // Fetch conversation messages
  const { isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const res = await apiFetch(`/chat/${currentConversationId}`);
      if (!res.ok) return [];
      const data = await res.json();
      setMessages(data);
      return data;
    },
    enabled: !!currentConversationId,
  });

  // Handle stream request
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    // Strict local guest check BEFORE sending to avoid wasting prompt calls
    const isDev = process.env.NEXT_PUBLIC_ENV === "development" || process.env.NODE_ENV === "development";
    if (!user && !isDev && guestPromptsUsed >= 5) {
      setShowSignupModal(true);
      return;
    }

    setIsGenerating(true);
    setInput("");
    setStreamContent("");

    // Add local user message immediately
    const tempUserMsg: Message = {
      _id: "temp-user-" + Date.now(),
      conversation_id: currentConversationId || "",
      role: "user",
      content: textToSend,
      token_usage: 0,
      created_at: new Date().toISOString()
    };
    setMessages([...messages, tempUserMsg]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (guestSessionId) {
        headers["X-Session-ID"] = guestSessionId;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: textToSend,
          conversation_id: currentConversationId,
          session_id: guestSessionId
        }),
        signal: controller.signal
      });

      if (response.status === 403) {
        // Guest limit hit
        const err = await response.json();
        setGuestPromptsUsed(5);
        setShowSignupModal(true);
        throw new Error(err.detail || "Limit reached");
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Network response was not ok");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let tempAssistantContent = "";
      let activeConvId = currentConversationId;

      if (!reader) return;

      let isStreamDone = false;
      let buffer = "";
      while (!isStreamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const completeMessage = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          
          if (completeMessage.startsWith("data: ")) {
            const dataStr = completeMessage.replace("data: ", "").trim();
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                
                if (parsed.conversation_id && parsed.is_new) {
                  // If it's a new conversation, save active conversation ID and refresh sidebar
                  activeConvId = parsed.conversation_id;
                  setCurrentConversationId(activeConvId);
                  queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }
                
                if (parsed.content) {
                  tempAssistantContent += parsed.content;
                  setStreamContent(tempAssistantContent);
                }

                if (parsed.prompts_used !== undefined) {
                  if (!user) {
                    setGuestPromptsUsed(parsed.prompts_used);
                  }
                }

                if (parsed.done) {
                  isStreamDone = true;
                  break;
                }
              } catch (err) {
                console.error("Failed to parse SSE JSON chunk:", err);
              }
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }

      // Immediately append the completed AI response to local state so the
      // message is visible without waiting for the DB round-trip.
      if (tempAssistantContent && activeConvId) {
        appendAssistantMessage(tempAssistantContent, activeConvId);
        // Then sync from the database in the background to replace the temp
        // local ID with the real MongoDB _id (needed for copy / regenerate).
        queryClient.invalidateQueries({ queryKey: ["messages", activeConvId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Generation aborted by user");
      } else {
        console.error("Chat streaming error:", error);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
      setStreamContent("");
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRegenerateLast = () => {
    // Find last user message in list to resend
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length > 0) {
      const lastText = userMsgs[userMsgs.length - 1].content;
      handleSendMessage(lastText);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(200, textarea.scrollHeight)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating) {
        handleSendMessage(input);
      }
    }
  };

  // Adjust textarea height on value change
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Find last assistant message ID
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const lastAssistantMsgId = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1]._id : null;

  const showBlurOverlay = showSignupModal;

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121] text-[#ececec] font-sans">
      
      {/* Desktop Sidebar with slide animation */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-[260px] translate-x-0" : "w-0 -translate-x-full"
        } h-full hidden md:block shrink-0 overflow-hidden`}
      >
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-[#171717]/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 w-[260px] animate-in slide-in-from-left duration-200 h-full">
            <Sidebar />
            <button 
              onClick={() => setMobileSidebarOpen(false)} 
              className="absolute top-4 right-[-48px] p-2 bg-[#171717] border border-white/5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main chat box */}
      <main className={`grow flex flex-col h-full overflow-hidden relative transition-all duration-300 ${showBlurOverlay ? "blur-md pointer-events-none select-none" : ""}`}>
        
        {/* Top Header bar */}
        <header className="h-14 flex items-center justify-between px-4 bg-[#212121] shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            {/* Desktop toggle sidebar button (when sidebar closed) */}
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex p-2 rounded-lg hover:bg-[#2f2f2f] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Sidebar Trigger */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[#2f2f2f] text-slate-400 hover:text-slate-200 block md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* New Chat Button when sidebar is closed */}
            {!sidebarOpen && (
              <button
                onClick={clearChat}
                className="hidden md:flex p-2 rounded-lg hover:bg-[#2f2f2f] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="New chat"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center Model Selector dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#2f2f2f] text-slate-300 font-semibold text-sm cursor-pointer select-none">
            <span>SupportAI 4.0</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>

          {/* Right Header limits */}
          <div className="flex items-center gap-2">
            {!user && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-emerald-400">
                {process.env.NEXT_PUBLIC_ENV === "development" || process.env.NODE_ENV === "development" 
                  ? `Guest Prompts: ${guestPromptsUsed} (Unlimited Dev)` 
                  : `Guest Limit: ${guestPromptsUsed}/5`}
              </span>
            )}
          </div>
        </header>

        {/* Messages / Welcome page */}
        <div className="grow overflow-y-auto px-4 py-8 space-y-6">
          {!currentConversationId && messages.length === 0 ? (
            // Welcome Suggestions page
            <div className="max-w-3xl mx-auto pt-16 text-center flex flex-col justify-center min-h-[60vh]">
              {/* OpenAI SVG Spiral Emblem */}
              <div className="mx-auto mb-6 text-[#ececec]">
                <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.74 11.9a.43.43 0 0 0-.25-.35 5.6 5.6 0 0 0-3.32-.23 5.6 5.6 0 0 0-4.83-2.77 5.6 5.6 0 0 0-2.88-5 5.6 5.6 0 0 0-5.32.2 5.6 5.6 0 0 0-1.84 5.48A5.6 5.6 0 0 0 1 12.1a5.6 5.6 0 0 0 3.32.22 5.6 5.6 0 0 0 4.83 2.78 5.6 5.6 0 0 0 2.88 5 5.6 5.6 0 0 0 5.32-.2 5.6 5.6 0 0 0 1.84-5.48 5.6 5.6 0 0 0 2.55-2.52zm-12.87 6.4a3.86 3.86 0 0 1-1.7-.82l2.67-1.54a.43.43 0 0 0 .22-.38v-3.7l1.1-.63 3.12 1.8v1.07a3.86 3.86 0 0 1-2.09 3.56zM5.56 14.5a3.86 3.86 0 0 1-.39-1.87v-3.08l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85V10.5l-3.12 1.8H5.66A3.86 3.86 0 0 1 5.56 14.5zm2.14-7.25a3.86 3.86 0 0 1 1.3-1.4l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85.93.53-3.12 1.8v3.6L10.05 10A3.86 3.86 0 0 1 7.7 7.25zm7.48.33l-2.67 1.54a.43.43 0 0 0-.21.37v3.7l-1.1.63L8.08 12v-1.07a3.86 3.86 0 0 1 2.09-3.56 3.86 3.86 0 0 1 5.01.21zm3.26 1.92a3.86 3.86 0 0 1 .39 1.88v3.08l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85v-1.26l3.12-1.8h2.69a3.86 3.86 0 0 1 .1-1.21zm-2.14 7.25a3.86 3.86 0 0 1-1.3 1.4l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85-.93-.53 3.12-1.8v-3.6l3.07 1.77c.81.47 1.47 1.13 1.94 1.94a3.86 3.86 0 0 1 .4 1.51z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-semibold text-white tracking-tight">What can I help with?</h2>
              
              <div className="grid sm:grid-cols-2 gap-3 mt-12 text-left max-w-2xl mx-auto w-full px-4">
                {SUGGESTED_PROMPTS.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="p-4 rounded-2xl border border-white/5 bg-[#2f2f2f]/30 hover:bg-[#2f2f2f]/60 transition-all text-xs text-slate-300 text-left flex flex-col justify-between gap-3 group cursor-pointer"
                    >
                      <p className="text-slate-200 leading-relaxed font-normal">{prompt.text}</p>
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 shrink-0 ${prompt.color}`} />
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Chat message list
            <div className="max-w-3xl mx-auto space-y-8 px-4">
              {messagesLoading ? (
                <div className="p-12 text-center text-slate-500 text-sm">Loading message history...</div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return isUser ? (
                    // User Message Row: Bubbled and aligned to the right
                    <div key={msg._id} className="flex flex-col items-end w-full">
                      <div className="bg-[#2f2f2f] text-[#ececec] rounded-[24px] px-5 py-2.5 max-w-[70%] text-sm select-text break-words">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    // Assistant Message Row: Full width, starts with OpenAI Avatar
                    <div key={msg._id} className="flex gap-4 w-full group/msg">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-[#10a37f] text-white flex items-center justify-center shrink-0 select-none shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21.74 11.9a.43.43 0 0 0-.25-.35 5.6 5.6 0 0 0-3.32-.23 5.6 5.6 0 0 0-4.83-2.77 5.6 5.6 0 0 0-2.88-5 5.6 5.6 0 0 0-5.32.2 5.6 5.6 0 0 0-1.84 5.48A5.6 5.6 0 0 0 1 12.1a5.6 5.6 0 0 0 3.32.22 5.6 5.6 0 0 0 4.83 2.78 5.6 5.6 0 0 0 2.88 5 5.6 5.6 0 0 0 5.32-.2 5.6 5.6 0 0 0 1.84-5.48 5.6 5.6 0 0 0 2.55-2.52zm-12.87 6.4a3.86 3.86 0 0 1-1.7-.82l2.67-1.54a.43.43 0 0 0 .22-.38v-3.7l1.1-.63 3.12 1.8v1.07a3.86 3.86 0 0 1-2.09 3.56zM5.56 14.5a3.86 3.86 0 0 1-.39-1.87v-3.08l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85V10.5l-3.12 1.8H5.66A3.86 3.86 0 0 1 5.56 14.5zm2.14-7.25a3.86 3.86 0 0 1 1.3-1.4l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85.93.53-3.12 1.8v3.6L10.05 10A3.86 3.86 0 0 1 7.7 7.25zm7.48.33l-2.67 1.54a.43.43 0 0 0-.21.37v3.7l-1.1.63L8.08 12v-1.07a3.86 3.86 0 0 1 2.09-3.56 3.86 3.86 0 0 1 5.01.21zm3.26 1.92a3.86 3.86 0 0 1 .39 1.88v3.08l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85v-1.26l3.12-1.8h2.69a3.86 3.86 0 0 1 .1-1.21zm-2.14 7.25a3.86 3.86 0 0 1-1.3 1.4l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85-.93-.53 3.12-1.8v-3.6l3.07 1.77c.81.47 1.47 1.13 1.94 1.94a3.86 3.86 0 0 1 .4 1.51z"/>
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="grow overflow-hidden flex flex-col min-w-0">
                        <div className="text-sm text-[#ececec]">
                          <Markdown content={msg.content} />
                        </div>
                        {/* Hover action buttons */}
                        <div className="flex items-center gap-2 mt-2.5 opacity-0 group-hover/msg:opacity-100 transition-opacity text-slate-500">
                          <button
                            onClick={() => handleCopyMessage(msg.content, msg._id)}
                            className="p-1 rounded hover:text-slate-300 hover:bg-[#2f2f2f] transition-all cursor-pointer"
                            title="Copy response"
                          >
                            {copiedMessageId === msg._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button className="p-1 rounded hover:text-slate-300 hover:bg-[#2f2f2f] transition-all cursor-pointer" title="Good response">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded hover:text-slate-300 hover:bg-[#2f2f2f] transition-all cursor-pointer" title="Bad response">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          {msg._id === lastAssistantMsgId && (
                            <button
                              onClick={handleRegenerateLast}
                              className="p-1 rounded hover:text-slate-300 hover:bg-[#2f2f2f] transition-all cursor-pointer"
                              title="Regenerate response"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Streaming Content output */}
              {isGenerating && streamContent && (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-[#10a37f] text-white flex items-center justify-center shrink-0 select-none shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.74 11.9a.43.43 0 0 0-.25-.35 5.6 5.6 0 0 0-3.32-.23 5.6 5.6 0 0 0-4.83-2.77 5.6 5.6 0 0 0-2.88-5 5.6 5.6 0 0 0-5.32.2 5.6 5.6 0 0 0-1.84 5.48A5.6 5.6 0 0 0 1 12.1a5.6 5.6 0 0 0 3.32.22 5.6 5.6 0 0 0 4.83 2.78 5.6 5.6 0 0 0 2.88 5 5.6 5.6 0 0 0 5.32-.2 5.6 5.6 0 0 0 1.84-5.48 5.6 5.6 0 0 0 2.55-2.52zm-12.87 6.4a3.86 3.86 0 0 1-1.7-.82l2.67-1.54a.43.43 0 0 0 .22-.38v-3.7l1.1-.63 3.12 1.8v1.07a3.86 3.86 0 0 1-2.09 3.56zM5.56 14.5a3.86 3.86 0 0 1-.39-1.87v-3.08l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85V10.5l-3.12 1.8H5.66A3.86 3.86 0 0 1 5.56 14.5zm2.14-7.25a3.86 3.86 0 0 1 1.3-1.4l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85.93.53-3.12 1.8v3.6L10.05 10A3.86 3.86 0 0 1 7.7 7.25zm7.48.33l-2.67 1.54a.43.43 0 0 0-.21.37v3.7l-1.1.63L8.08 12v-1.07a3.86 3.86 0 0 1 2.09-3.56 3.86 3.86 0 0 1 5.01.21zm3.26 1.92a3.86 3.86 0 0 1 .39 1.88v3.08l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85v-1.26l3.12-1.8h2.69a3.86 3.86 0 0 1 .1-1.21zm-2.14 7.25a3.86 3.86 0 0 1-1.3 1.4l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85-.93-.53 3.12-1.8v-3.6l3.07 1.77c.81.47 1.47 1.13 1.94 1.94a3.86 3.86 0 0 1 .4 1.51z"/>
                    </svg>
                  </div>
                  <div className="grow overflow-hidden flex flex-col min-w-0">
                    <div className="text-sm text-[#ececec]">
                      <Markdown content={streamContent} />
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming dot loader (if streaming requested but content is empty yet) */}
              {isGenerating && !streamContent && (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-[#10a37f] text-white flex items-center justify-center shrink-0 select-none shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.74 11.9a.43.43 0 0 0-.25-.35 5.6 5.6 0 0 0-3.32-.23 5.6 5.6 0 0 0-4.83-2.77 5.6 5.6 0 0 0-2.88-5 5.6 5.6 0 0 0-5.32.2 5.6 5.6 0 0 0-1.84 5.48A5.6 5.6 0 0 0 1 12.1a5.6 5.6 0 0 0 3.32.22 5.6 5.6 0 0 0 4.83 2.78 5.6 5.6 0 0 0 2.88 5 5.6 5.6 0 0 0 5.32-.2 5.6 5.6 0 0 0 1.84-5.48 5.6 5.6 0 0 0 2.55-2.52zm-12.87 6.4a3.86 3.86 0 0 1-1.7-.82l2.67-1.54a.43.43 0 0 0 .22-.38v-3.7l1.1-.63 3.12 1.8v1.07a3.86 3.86 0 0 1-2.09 3.56zM5.56 14.5a3.86 3.86 0 0 1-.39-1.87v-3.08l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85V10.5l-3.12 1.8H5.66A3.86 3.86 0 0 1 5.56 14.5zm2.14-7.25a3.86 3.86 0 0 1 1.3-1.4l2.67 1.54a.43.43 0 0 0 .43 0l3.2-1.85.93.53-3.12 1.8v3.6L10.05 10A3.86 3.86 0 0 1 7.7 7.25zm7.48.33l-2.67 1.54a.43.43 0 0 0-.21.37v3.7l-1.1.63L8.08 12v-1.07a3.86 3.86 0 0 1 2.09-3.56 3.86 3.86 0 0 1 5.01.21zm3.26 1.92a3.86 3.86 0 0 1 .39 1.88v3.08l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85v-1.26l3.12-1.8h2.69a3.86 3.86 0 0 1 .1-1.21zm-2.14 7.25a3.86 3.86 0 0 1-1.3 1.4l-2.67-1.54a.43.43 0 0 0-.43 0l-3.2 1.85-.93-.53 3.12-1.8v-3.6l3.07 1.77c.81.47 1.47 1.13 1.94 1.94a3.86 3.86 0 0 1 .4 1.51z"/>
                    </svg>
                  </div>
                  <div className="grow overflow-hidden flex items-center gap-1.5 min-w-0 pl-1.5 h-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ececec]/60 pulse-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ececec]/60 pulse-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ececec]/60 pulse-dot" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box bottom panel */}
        <div className="p-4 bg-[#212121] shrink-0">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Input capsule container styled to match ChatGPT exactly */}
            <div className="relative rounded-[26px] bg-[#2f2f2f] border border-white/5 p-1.5 shadow-md transition-all flex items-end">
              
              {/* Attachment Icon */}
              <button 
                type="button"
                className="w-9 h-9 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 flex items-center justify-center shrink-0 mb-0.5 cursor-pointer"
                title="Attach files"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>

              {/* Textarea — shows interim voice transcript as faded overlay text */}
              <div className="relative grow flex items-end">
                <textarea
                  ref={textareaRef}
                  className="grow w-full pl-2 pr-2 py-2 bg-transparent border-0 text-[#ececec] placeholder:text-slate-500 focus:outline-none focus:ring-0 text-sm resize-none h-10 scrollbar-none"
                  placeholder={
                    isRecording
                      ? "Listening…"
                      : isGenerating
                      ? "Generation in progress..."
                      : "Message SupportAI..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                {/* Interim transcript preview rendered below the committed text */}
                {isRecording && interimTranscript && (
                  <span className="absolute left-2 bottom-2 text-sm text-slate-400 italic pointer-events-none truncate max-w-[90%]">
                    {input ? " " : ""}{interimTranscript}
                  </span>
                )}
              </div>

              {/* Mic Button — animated when recording */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isGenerating}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 mr-1 transition-all cursor-pointer
                    ${
                      isRecording
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-2 ring-red-500/40"
                        : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                    }
                    ${isGenerating ? "opacity-30 cursor-not-allowed" : ""}
                  `}
                  title={isRecording ? "Stop recording" : "Voice input"}
                >
                  {isRecording ? (
                    <span className="relative flex items-center justify-center">
                      {/* Outer pulse ring */}
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-ping" />
                      <MicOff className="w-4 h-4 relative z-10" />
                    </span>
                  ) : (
                    <Mic className="w-4.5 h-4.5" />
                  )}
                </button>

                {/* Voice error tooltip */}
                {voiceError && (
                  <div className="absolute bottom-12 right-0 w-64 bg-[#1a1a1a] border border-red-500/30 rounded-xl p-3 text-xs text-red-400 shadow-xl z-50">
                    <div className="flex items-start justify-between gap-2">
                      <span>{voiceError}</span>
                      <button
                        onClick={() => setVoiceError(null)}
                        className="text-slate-500 hover:text-slate-300 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Circular Send / Stop Button */}
              {isGenerating ? (
                <button
                  onClick={stopGeneration}
                  className="w-8 h-8 rounded-full bg-[#ececec] text-[#212121] hover:bg-[#ececec]/90 flex items-center justify-center cursor-pointer shrink-0 mb-1"
                  title="Stop generating"
                >
                  <span className="w-3.5 h-3.5 bg-[#212121] rounded-[2px]" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0 mb-1 ${
                    !input.trim() 
                      ? "bg-[#212121]/50 text-slate-600" 
                      : "bg-[#ececec] text-[#212121] hover:bg-[#ececec]/90"
                  }`}
                  title="Send message"
                >
                  <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>
              )}
            </div>
            
            <p className="text-center text-[10px] text-slate-500 mt-2">
              SupportAI can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </main>

      {/* Lockout Modal */}
      <SignupModal />
    </div>
  );
}
