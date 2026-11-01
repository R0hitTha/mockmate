import { prisma } from "@/lib/prisma";
import { getStudentProfile } from "@/lib/auth-server";
import { getStudentDashboardMistakeSummary } from "@/lib/mistake-service";
import { getStudentStudyPreferences } from "@/lib/study-planner-service";

export interface StoredAIConversation {
  id: string;
  studentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAIMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  providerMetadata?: string | null;
  createdAt: string;
}

export interface AIProviderStatus {
  isConfigured: boolean;
  providerName: string;
  modelName: string;
  dailyQuotaLimit: number;
  remainingDailyQuota: number;
  setupInstructions?: string;
}

export interface SendMessageResult {
  message: StoredAIMessage;
  usageRemaining: number;
  provider: string;
}

// =============================================================================
// PROVIDER ABSTRACTION INTERFACE
// =============================================================================

export interface AIProvider {
  name: string;
  model: string;
  isAvailable(): boolean;
  generateResponse(
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage?: number }>;
}

/**
 * Google Gemini Provider Implementation
 */
export class GeminiProvider implements AIProvider {
  name = "google";
  model = "gemini-2.0-flash";

  isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  }

  async generateResponse(
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage?: number }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in server environment.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

    const formattedContents = [
      {
        role: "user",
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}` }],
      },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedContents }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errorText.slice(0, 200)}`);
      }

      const data = await res.json();
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I could not generate an answer at this time. Please try again.";
      const tokenUsage = data.usageMetadata?.totalTokenCount || 0;

      return { text: generatedText, tokenUsage };
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * OpenAI / Compatible Provider Implementation
 */
export class OpenAIProvider implements AIProvider {
  name = "openai";
  model = "gpt-4o-mini";

  isAvailable(): boolean {
    return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
  }

  async generateResponse(
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage?: number }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured in server environment.");
    }

    const endpoint = "https://api.openai.com/v1/chat/completions";

    const payloadMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: payloadMessages,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API error (${res.status}): ${errorText.slice(0, 200)}`);
      }

      const data = await res.json();
      const generatedText =
        data.choices?.[0]?.message?.content ||
        "I could not generate an answer at this time. Please try again.";
      const tokenUsage = data.usage?.total_tokens || 0;

      return { text: generatedText, tokenUsage };
    } finally {
      clearTimeout(timeout);
    }
  }
}

// Select active provider
function getActiveProvider(): AIProvider | null {
  const gemini = new GeminiProvider();
  if (gemini.isAvailable()) return gemini;

  const openai = new OpenAIProvider();
  if (openai.isAvailable()) return openai;

  return null;
}

// =============================================================================
// IN-MEMORY RESILIENT STORE FOR CONVERSATIONS & USAGE (TEST/LOCAL COMPAT)
// =============================================================================

class AIAssistantMemoryStore {
  private conversations = new Map<string, StoredAIConversation>();
  private messages = new Map<string, StoredAIMessage>();
  private usages = new Map<string, number>(); // key: `${studentId}::${date}` -> count

  reset() {
    this.conversations.clear();
    this.messages.clear();
    this.usages.clear();
  }

  // Conversations
  getConversation(id: string): StoredAIConversation | null {
    return this.conversations.get(id) || null;
  }

  listStudentConversations(studentId: string): StoredAIConversation[] {
    return Array.from(this.conversations.values())
      .filter((c) => c.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveConversation(conv: StoredAIConversation) {
    this.conversations.set(conv.id, conv);
  }

  deleteConversation(id: string): boolean {
    // Delete messages
    for (const [msgId, msg] of this.messages.entries()) {
      if (msg.conversationId === id) {
        this.messages.delete(msgId);
      }
    }
    return this.conversations.delete(id);
  }

  // Messages
  saveMessage(msg: StoredAIMessage) {
    this.messages.set(msg.id, msg);
  }

  listMessages(conversationId: string): StoredAIMessage[] {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  clearMessages(conversationId: string) {
    for (const [id, m] of this.messages.entries()) {
      if (m.conversationId === conversationId) {
        this.messages.delete(id);
      }
    }
  }

  // Daily Usage Tracking
  getUsageCount(studentId: string, date: string): number {
    return this.usages.get(`${studentId}::${date}`) || 0;
  }

  incrementUsage(studentId: string, date: string): number {
    const key = `${studentId}::${date}`;
    const cur = this.usages.get(key) || 0;
    this.usages.set(key, cur + 1);
    return cur + 1;
  }
}

export const aiAssistantMemoryStore = new AIAssistantMemoryStore();

// =============================================================================
// PROVIDER STATUS & QUOTA CHECKS
// =============================================================================

const DAILY_QUOTA_LIMIT = 20; // 20 free questions / assistant requests per student per day

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getAIProviderStatus(studentId: string): Promise<AIProviderStatus> {
  const provider = getActiveProvider();
  const today = getTodayDateString();
  const currentUsage = aiAssistantMemoryStore.getUsageCount(studentId, today);
  const remaining = Math.max(0, DAILY_QUOTA_LIMIT - currentUsage);

  if (!provider) {
    return {
      isConfigured: false,
      providerName: "None (Unconfigured)",
      modelName: "None",
      dailyQuotaLimit: DAILY_QUOTA_LIMIT,
      remainingDailyQuota: remaining,
      setupInstructions:
        "To enable the AI Study Assistant, add GEMINI_API_KEY or OPENAI_API_KEY in your .env file. The Rule-Based Study Planner remains fully operational without an external AI provider.",
    };
  }

  return {
    isConfigured: true,
    providerName: provider.name,
    modelName: provider.model,
    dailyQuotaLimit: DAILY_QUOTA_LIMIT,
    remainingDailyQuota: remaining,
  };
}

// =============================================================================
// CONVERSATIONS MANAGEMENT
// =============================================================================

export async function getStudentConversations(studentId: string): Promise<StoredAIConversation[]> {
  try {
    const dbConvs = await prisma.aIConversation.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    if (dbConvs.length > 0) {
      return dbConvs.map((c) => ({
        id: c.id,
        studentId: c.studentId,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    }
  } catch {
    // DB fallback
  }

  return aiAssistantMemoryStore.listStudentConversations(studentId);
}

export async function createAIConversation(
  studentId: string,
  title?: string
): Promise<StoredAIConversation> {
  const now = new Date();
  const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const defaultTitle = title?.trim() || "CUET Study Session";

  const conv: StoredAIConversation = {
    id,
    studentId,
    title: defaultTitle,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  aiAssistantMemoryStore.saveConversation(conv);

  try {
    await prisma.aIConversation.create({
      data: {
        id,
        studentId,
        title: defaultTitle,
      },
    });
  } catch {
    // DB fallback
  }

  return conv;
}

export async function getConversationMessages(
  studentId: string,
  conversationId: string
): Promise<StoredAIMessage[]> {
  // Validate ownership
  const conv = aiAssistantMemoryStore.getConversation(conversationId);
  if (conv && conv.studentId !== studentId) {
    throw new Error("Unauthorized: You do not have access to this conversation");
  }

  try {
    const dbMsgs = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    if (dbMsgs.length > 0) {
      return dbMsgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        providerMetadata: m.providerMetadata,
        createdAt: m.createdAt.toISOString(),
      }));
    }
  } catch {
    // DB fallback
  }

  return aiAssistantMemoryStore.listMessages(conversationId);
}

export async function deleteAIConversation(
  studentId: string,
  conversationId: string
): Promise<boolean> {
  const conv = aiAssistantMemoryStore.getConversation(conversationId);
  if (conv && conv.studentId !== studentId) {
    throw new Error("Unauthorized: You cannot delete another student's conversation");
  }

  aiAssistantMemoryStore.deleteConversation(conversationId);

  try {
    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });
  } catch {
    // DB fallback
  }

  return true;
}

export async function clearAIConversation(
  studentId: string,
  conversationId: string
): Promise<boolean> {
  const conv = aiAssistantMemoryStore.getConversation(conversationId);
  if (conv && conv.studentId !== studentId) {
    throw new Error("Unauthorized: You cannot clear another student's conversation");
  }

  aiAssistantMemoryStore.clearMessages(conversationId);

  try {
    await prisma.aIMessage.deleteMany({
      where: { conversationId },
    });
  } catch {
    // DB fallback
  }

  return true;
}

// =============================================================================
// SYSTEM PROMPT & CONTEXT GENERATION
// =============================================================================

async function buildCUETSystemPrompt(studentId: string, includeStudyContext: boolean): Promise<string> {
  let contextSnippet = "";

  if (includeStudyContext) {
    try {
      const [profile, mistakes, prefs] = await Promise.all([
        getStudentProfile(studentId),
        getStudentDashboardMistakeSummary(studentId),
        getStudentStudyPreferences(studentId),
      ]);

      const targetYear = profile?.targetExamYear || 2026;
      const stream = profile?.stream || "General";
      const subjects = profile?.subjectPreferences?.map((s) => s.subjectName).join(", ") || "CUET Core";
      const struggleTopic = mistakes.topStruggleTopic
        ? `${mistakes.topStruggleTopic.topicTitle} (${mistakes.topStruggleTopic.subjectName})`
        : "None identified yet";

      contextSnippet = `
STUDENT PREPARATION CONTEXT:
- Target CUET Exam Year: ${targetYear}
- Stream: ${stream}
- Enrolled Subjects: ${subjects}
- Primary Improvement Area (from test attempts): ${struggleTopic}
- Daily Study Target: ${prefs.dailyTargetMinutes} minutes
- Active Study Days: ${prefs.preferredStudyDays.join(", ")}
`;
    } catch {
      // Ignore context errors
    }
  }

  return `You are MockMate's AI Study Assistant for CUET UG aspirants.
You provide clear, accurate, and encouraging academic guidance strictly aligned with the NTA CUET UG syllabus and NCERT Class 12 curriculum.

GUIDELINES:
1. Explain difficult scientific, mathematical, and conceptual topics clearly with step-by-step reasoning.
2. Emphasize NCERT Class 12 definitions, formulas, and principles.
3. Keep answers concise, readable, and structured with headings or bullet points where appropriate.
4. When helping with revision, recommend actionable study techniques (e.g. active recall, formula sheets, solving previous years' questions).
5. SAFETY & BOUNDARIES:
   - You are a preparation coach, not an official NTA spokesperson. Do not invent official exam schedules or rules.
   - Do NOT provide correct answers or leaks for active, ongoing mock examinations.
   - Never reveal passwords, user IDs, or internal platform technical details.
   - If a topic or inquiry falls outside CUET UG scope, politely redirect the student back to their CUET subjects.
${contextSnippet}`;
}

// =============================================================================
// SEND MESSAGE ACTION & CHAT EXECUTION
// =============================================================================

export async function sendChatMessage(
  studentId: string,
  conversationId: string,
  userMessageContent: string,
  includeStudyContext = true
): Promise<SendMessageResult> {
  const provider = getActiveProvider();
  if (!provider) {
    throw new Error(
      "AI Study Assistant requires an API key. Please configure GEMINI_API_KEY or OPENAI_API_KEY in your environment."
    );
  }

  const today = getTodayDateString();
  const currentUsage = aiAssistantMemoryStore.getUsageCount(studentId, today);
  if (currentUsage >= DAILY_QUOTA_LIMIT) {
    throw new Error(
      `Daily quota limit reached (${DAILY_QUOTA_LIMIT} requests/day). Your quota will reset tomorrow.`
    );
  }

  // 1. Verify / ensure conversation exists
  let conv = aiAssistantMemoryStore.getConversation(conversationId);
  if (!conv) {
    conv = await createAIConversation(studentId, userMessageContent.slice(0, 30));
  } else if (conv.studentId !== studentId) {
    throw new Error("Unauthorized: You do not own this conversation");
  }

  const now = new Date();
  const userMsgId = `msg-${Date.now()}-user`;
  const userMsg: StoredAIMessage = {
    id: userMsgId,
    conversationId: conv.id,
    role: "user",
    content: userMessageContent,
    createdAt: now.toISOString(),
  };

  aiAssistantMemoryStore.saveMessage(userMsg);
  try {
    await prisma.aIMessage.create({
      data: {
        id: userMsgId,
        conversationId: conv.id,
        role: "user",
        content: userMessageContent,
      },
    });
  } catch {
    // DB fallback
  }

  // 2. Load recent conversation history (last 8 messages for context window)
  const history = await getConversationMessages(studentId, conv.id);
  const contextMessages = history.slice(-8).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 3. Build system prompt
  const systemPrompt = await buildCUETSystemPrompt(studentId, includeStudyContext);

  // 4. Generate AI response via provider
  const response = await provider.generateResponse(contextMessages, systemPrompt);

  // 5. Store assistant reply
  const assistantMsgId = `msg-${Date.now()}-assistant`;
  const assistantMsg: StoredAIMessage = {
    id: assistantMsgId,
    conversationId: conv.id,
    role: "assistant",
    content: response.text,
    providerMetadata: JSON.stringify({
      provider: provider.name,
      model: provider.model,
      tokenUsage: response.tokenUsage,
    }),
    createdAt: new Date().toISOString(),
  };

  aiAssistantMemoryStore.saveMessage(assistantMsg);
  try {
    await prisma.aIMessage.create({
      data: {
        id: assistantMsgId,
        conversationId: conv.id,
        role: "assistant",
        content: response.text,
        providerMetadata: assistantMsg.providerMetadata,
      },
    });
  } catch {
    // DB fallback
  }

  // 6. Record usage
  aiAssistantMemoryStore.incrementUsage(studentId, today);
  const remaining = Math.max(0, DAILY_QUOTA_LIMIT - (currentUsage + 1));

  return {
    message: assistantMsg,
    usageRemaining: remaining,
    provider: provider.name,
  };
}
