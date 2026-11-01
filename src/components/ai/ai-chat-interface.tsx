"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  Key,
  MessageSquare,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  type StoredAIConversation,
  type StoredAIMessage,
  type AIProviderStatus,
} from "@/lib/ai-assistant-service";
import {
  getAIProviderStatusAction,
  getConversationsAction,
  createConversationAction,
  getConversationMessagesAction,
  sendChatMessageAction,
  deleteConversationAction,
  clearConversationAction,
} from "@/actions/ai-actions";

export function AIChatInterface() {
  const [status, setStatus] = useState<AIProviderStatus | null>(null);
  const [conversations, setConversations] = useState<StoredAIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoredAIMessage[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial load
  useEffect(() => {
    async function init() {
      const [statusRes, convRes] = await Promise.all([
        getAIProviderStatusAction(),
        getConversationsAction(),
      ]);

      if (statusRes.success && statusRes.data) {
        setStatus(statusRes.data);
      }
      if (convRes.success && convRes.data) {
        setConversations(convRes.data);
        if (convRes.data.length > 0) {
          setActiveConvId(convRes.data[0].id);
        }
      }
    }
    init();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    let isSubscribed = true;
    getConversationMessagesAction(activeConvId)
      .then((res) => {
        if (isSubscribed && res.success && res.data) {
          setMessages(res.data);
        }
      })
      .catch(() => {
        if (isSubscribed) setError("Failed to load conversation messages.");
      });

    return () => {
      isSubscribed = false;
    };
  }, [activeConvId]);

  const handleNewConversation = async () => {
    try {
      const res = await createConversationAction({ title: "New CUET Discussion" });
      if (res.success && res.data) {
        setConversations([res.data, ...conversations]);
        setActiveConvId(res.data.id);
        setMessages([]);
      }
    } catch {
      setError("Failed to create new conversation.");
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await deleteConversationAction({ conversationId: convId });
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch {
      setError("Failed to delete conversation.");
    }
  };

  const handleClearMessages = async () => {
    if (!activeConvId) return;
    if (!confirm("Clear all messages in this conversation?")) return;

    try {
      await clearConversationAction({ conversationId: activeConvId });
      setMessages([]);
    } catch {
      setError("Failed to clear messages.");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputContent).trim();
    if (!text || loading) return;

    if (!status?.isConfigured) {
      setError("AI Provider is not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY in server environment.");
      return;
    }

    let targetConvId = activeConvId;
    if (!targetConvId) {
      const newConvRes = await createConversationAction({ title: text.slice(0, 30) });
      if (newConvRes.success && newConvRes.data) {
        setConversations([newConvRes.data, ...conversations]);
        setActiveConvId(newConvRes.data.id);
        targetConvId = newConvRes.data.id;
      } else {
        setError("Failed to create conversation session.");
        return;
      }
    }

    // Optimistically add user message
    const tempUserMsg: StoredAIMessage = {
      id: `temp-${targetConvId}-${messages.length + 1}`,
      conversationId: targetConvId,
      role: "user",
      content: text,
      createdAt: "Just now",
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputContent("");
    setLoading(true);
    setError(null);

    try {
      const res = await sendChatMessageAction({
        conversationId: targetConvId,
        content: text,
        includeStudyContext: true,
      });

      if (!res.success || !res.data) {
        setError(res.error || "Failed to receive AI response.");
      } else {
        setMessages((prev) => [...prev, res.data.message]);
        if (status) {
          setStatus({
            ...status,
            remainingDailyQuota: res.data.usageRemaining,
          });
        }
      }
    } catch {
      setError("An unexpected error occurred while communicating with the AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputContent(promptText);
    handleSendMessage(promptText);
  };

  const quickPrompts = [
    "Explain the key principles of Wave Optics for CUET",
    "How should I structure my final month revision for Physics & Chemistry?",
    "What are the highest-yield chapters in CUET General Test?",
    "Tips to avoid negative marking in CUET domain exams",
  ];

  return (
    <div className="bg-surface rounded-xl border border-border shadow-xs overflow-hidden flex flex-col md:flex-row h-[720px]">
      {/* Sidebar: Conversation Threads */}
      <div className="w-full md:w-64 border-r border-border flex flex-col bg-muted/10">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" /> Discussions
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewConversation}
            className="h-7 text-xs px-2 gap-1"
          >
            <Plus className="w-3 h-3" /> New
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No conversations yet. Start one!
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  activeConvId === c.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span className="truncate flex-1 mr-2">{c.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:text-destructive rounded transition-opacity ${
                    activeConvId === c.id ? "hover:text-white" : ""
                  }`}
                  title="Delete Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Provider Status / Quota Banner */}
        <div className="p-3 border-t border-border bg-surface text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[11px]">Daily Quota</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {status?.remainingDailyQuota ?? 20} / {status?.dailyQuotaLimit ?? 20} left
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <Bot className="w-3 h-3 text-primary" />
            <span className="truncate">
              {status?.isConfigured ? `${status.providerName} (${status.modelName})` : "Unconfigured"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface min-w-0">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">CUET AI Study Assistant</h2>
              <p className="text-[11px] text-muted">Syllabus-aligned NCERT concepts &amp; strategy</p>
            </div>
          </div>

          {activeConvId && messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMessages}
              className="text-xs h-7 gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear Chat
            </Button>
          )}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!status?.isConfigured && (
            <div className="bg-amber-500/10 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Key className="w-4 h-4 text-amber-700" />
                <span>AI Assistant Setup Required</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                To activate the interactive AI assistant, configure a free or standard API key in your server environment:
              </p>
              <code className="block bg-surface p-2 rounded border border-border text-[11px] text-foreground font-mono">
                GEMINI_API_KEY=&quot;your-google-gemini-api-key&quot;
              </code>
              <p className="text-[11px] text-muted">
                Note: The core Study Planner, timetable generation, and mistake analytics do NOT require an AI key and are fully functional.
              </p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  How can I help you prepare today?
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Ask conceptual doubts, clarify Class 12 NCERT topics, or ask for strategy tips tailored to your CUET subjects.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2 pt-2 text-left">
                <span className="text-[11px] font-semibold text-muted tracking-wider uppercase block text-center">
                  Suggested Prompts
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {quickPrompts.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickPrompt(q)}
                      disabled={!status?.isConfigured}
                      className="text-xs p-2.5 rounded-lg border border-border bg-surface-elevated hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground text-left flex items-center justify-between"
                    >
                      <span>{q}</span>
                      <Sparkles className="w-3 h-3 text-primary shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/40 border border-border text-foreground rounded-bl-none shadow-2xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        isUser ? "text-primary-foreground/70" : "text-muted"
                      }`}
                    >
                      {m.createdAt === "Just now"
                        ? "Just now"
                        : new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-surface border border-border text-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted/40 border border-border rounded-2xl rounded-bl-none p-3.5 text-xs text-muted flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Generating CUET explanation...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 sm:p-4 border-t border-border bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 items-end"
          >
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                status?.isConfigured
                  ? "Ask about a CUET topic, formula, or study approach..."
                  : "AI provider not configured in environment..."
              }
              disabled={!status?.isConfigured || loading}
              className="resize-none min-h-[44px] max-h-32 text-xs sm:text-sm py-2.5"
              rows={1}
            />

            <Button
              type="submit"
              disabled={!status?.isConfigured || !inputContent.trim() || loading}
              size="default"
              className="h-11 px-4 gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted px-1">
            <span>Shift + Enter for new line</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Strict NCERT Class 12 scope
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
