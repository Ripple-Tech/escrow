import { z } from "zod"

// Message validator
export const MESSAGE_VALIDATOR = z.object({
  id: z.string().uuid().optional(),
  body: z.string().optional(),
  image: z.string().url().optional(),
  createdAt: z.date().optional(),
  seenIds: z.array(z.string().uuid()).optional(),
  senderId: z.string().uuid(),
  conversationId: z.string().uuid(),
})

// Conversation validator
export const CONVERSATION_VALIDATOR = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  lastMessageAt: z.date().optional(),
  escrowId: z.string().uuid().optional(),
  messagesIds: z.array(z.string().uuid()).optional(),
  userIds: z.array(z.string().uuid()).min(2, "Conversation must have at least two users."),
  // include nested messages if needed
  messages: z.array(MESSAGE_VALIDATOR).optional(),
})
