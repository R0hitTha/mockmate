import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().max(80, "Title cannot exceed 80 characters").optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  content: z
    .string()
    .min(1, "Message content cannot be empty")
    .max(3000, "Message cannot exceed 3,000 characters"),
  includeStudyContext: z.boolean().default(true),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const clearConversationSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
});

export type ClearConversationInput = z.infer<typeof clearConversationSchema>;

export const deleteConversationSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
});

export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>;
