"use server";

import { getServerSession } from "@/lib/auth-server";
import {
  createConversationSchema,
  sendMessageSchema,
  clearConversationSchema,
  deleteConversationSchema,
  type CreateConversationInput,
  type SendMessageInput,
  type ClearConversationInput,
  type DeleteConversationInput,
} from "@/lib/validations/ai";
import {
  getAIProviderStatus,
  getStudentConversations,
  createAIConversation,
  getConversationMessages,
  deleteAIConversation,
  clearAIConversation,
  sendChatMessage,
} from "@/lib/ai-assistant-service";

export async function getAIProviderStatusAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const status = await getAIProviderStatus(session.user.id);
    return { success: true, data: status };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to check AI provider status.",
    };
  }
}

export async function getConversationsAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const conversations = await getStudentConversations(session.user.id);
    return { success: true, data: conversations };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load conversations.",
    };
  }
}

export async function createConversationAction(input?: CreateConversationInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const validated = createConversationSchema.safeParse(input || {});
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid title provided.",
      };
    }

    const conversation = await createAIConversation(session.user.id, validated.data.title);
    return { success: true, data: conversation };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to create conversation.",
    };
  }
}

export async function getConversationMessagesAction(conversationId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    if (!conversationId) {
      return { success: false, error: "Conversation ID is required." };
    }

    const messages = await getConversationMessages(session.user.id, conversationId);
    return { success: true, data: messages };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load messages.",
    };
  }
}

export async function sendChatMessageAction(input: SendMessageInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const validated = sendMessageSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid message data.",
      };
    }

    const result = await sendChatMessage(
      session.user.id,
      validated.data.conversationId,
      validated.data.content,
      validated.data.includeStudyContext
    );

    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to generate AI response.",
    };
  }
}

export async function deleteConversationAction(input: DeleteConversationInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const validated = deleteConversationSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Valid conversation ID required." };
    }

    await deleteAIConversation(session.user.id, validated.data.conversationId);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to delete conversation.",
    };
  }
}

export async function clearConversationAction(input: ClearConversationInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const validated = clearConversationSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Valid conversation ID required." };
    }

    await clearAIConversation(session.user.id, validated.data.conversationId);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to clear conversation messages.",
    };
  }
}
