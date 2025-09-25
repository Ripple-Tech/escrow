import { db } from "@/db"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { pusherServer } from "@/lib/pusher"

// Helpers
const ensureUserInConversation = async (conversationId: string, userId: string) => {
  const convo = await db.conversation.findFirst({
    where: { 
      id: conversationId, 
      userIds: { has: userId } // Use userIds array instead of users relation
    },
    select: { id: true },
  })
  if (!convo) {
    throw new HTTPException(403, { message: "[FORBIDDEN] You are not a member of this conversation." })
  }
}

export const conversationRouter = router({
  // Create a conversation (1:1 or with multiple members). Optional escrowId links conversation to an escrow.
  createConversation: privateProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).min(1), // Remove .uuid() constraint
        escrowId: z.string().optional(), // Remove .uuid() constraint
      })
    )
    .mutation(async ({ ctx, input, c }) => {
      const me = ctx.user
      if (!me?.id) throw new HTTPException(401, { message: "Unauthorized" })

      // Ensure escrow belongs to user if provided
      if (input.escrowId) {
        const escrow = await db.escrow.findFirst({
          where: { id: input.escrowId, OR: [{ senderId: me.id }, { receiverId: me.id }] },
          select: { id: true },
        })
        if (!escrow) throw new HTTPException(404, { message: "[ESCROW_NOT_FOUND_OR_FORBIDDEN]" })
      }

      const memberIds = Array.from(new Set([me.id, ...input.userIds]))

      // Deduplicate: check if conversation already exists (userIds match)
      const existing = await db.conversation.findFirst({
        where: {
          escrowId: input.escrowId ?? null,
          userIds: { hasEvery: memberIds },
        },
        include: { users: true },
      })
      if (existing) {
        return c.superjson({ conversation: existing })
      }

      const newConversation = await db.conversation.create({
        data: {
          escrowId: input.escrowId ?? null,
          users: { connect: memberIds.map((id) => ({ id })) },
          userIds: memberIds,
        },
        include: { users: true },
      })

      // Notify participants
      for (const u of newConversation.users) {
        if (u.email) {
          await pusherServer.trigger(u.email, "conversation:new", newConversation)
        }
      }

      return c.superjson({ conversation: newConversation })
    }),

  // Get a single conversation with messages
  getConversation: privateProcedure
    .input(z.object({ conversationId: z.string() })) // Remove .uuid() constraint
    .query(async ({ ctx, input, c }) => {
      await ensureUserInConversation(input.conversationId, ctx.user.id)

      const conversation = await db.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          users: { select: { id: true, email: true, name: true } },
          messages: {
            include: { 
              sender: { select: { id: true, email: true, name: true } },
              // For seen, we need to handle the array differently since it's stored as seenIds
            },
            orderBy: { createdAt: "asc" },
          },
        },
      })
      if (!conversation) throw new HTTPException(404, { message: "[CONVERSATION_NOT_FOUND]" })
      
      // Enhance messages with seen users data
      const messagesWithSeen = await Promise.all(
        conversation.messages.map(async (message) => {
          const seenUsers = await db.user.findMany({
            where: { id: { in: message.seenIds } },
            select: { id: true, email: true, name: true },
          })
          return {
            ...message,
            seen: seenUsers,
          }
        })
      )

      return c.superjson({ 
        conversation: {
          ...conversation,
          messages: messagesWithSeen,
        }
      })
    }),

  // List all conversations for current user
  listConversations: privateProcedure.query(async ({ ctx, c }) => {
    const convos = await db.conversation.findMany({
      where: { userIds: { has: ctx.user.id } }, // Use userIds array
      orderBy: { lastMessageAt: "desc" },
      include: {
        users: { select: { id: true, email: true, name: true } },
        messages: { 
          take: 1, 
          orderBy: { createdAt: "desc" },
          include: { sender: { select: { id: true, email: true, name: true } } }
        },
      },
    })
    return c.superjson({ conversations: convos })
  }),

  // Send a message
  sendMessage: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
        message: z.string().trim().min(1).max(4000),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input, c }) => {
      await ensureUserInConversation(input.conversationId, ctx.user.id)

      const newMessage = await db.message.create({
        data: {
          body: input.message,
          image: input.image,
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          seenIds: [ctx.user.id], // Use seenIds array
        },
        include: { 
          sender: { select: { id: true, email: true, name: true } },
        },
      })

      // Update conversation last message time
      await db.conversation.update({
        where: { id: input.conversationId },
        data: { lastMessageAt: new Date() },
      })

      // Get all users in conversation for notification
      const conversation = await db.conversation.findUnique({
        where: { id: input.conversationId },
        include: { users: { select: { id: true, email: true } } },
      })

      // Push realtime events
      await pusherServer.trigger(input.conversationId, "messages:new", newMessage)
      if (conversation) {
        for (const u of conversation.users) {
          if (u.email) {
            await pusherServer.trigger(u.email, "conversation:update", {
              id: input.conversationId,
              messages: [newMessage],
            })
          }
        }
      }

      return c.superjson({ message: newMessage })
    }),

  // Delete message (only sender)
  deleteMessage: privateProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input, c }) => {
      const msg = await db.message.findUnique({
        where: { id: input.messageId },
        select: { id: true, senderId: true, conversationId: true },
      })
      if (!msg) throw new HTTPException(404, { message: "[MESSAGE_NOT_FOUND]" })
      if (msg.senderId !== ctx.user.id) throw new HTTPException(403, { message: "[FORBIDDEN_DELETE]" })

      await ensureUserInConversation(msg.conversationId, ctx.user.id)

      await db.message.delete({ where: { id: input.messageId } })
      await pusherServer.trigger(msg.conversationId, "message:deleted", { id: input.messageId })

      return c.superjson({ success: true })
    }),

  // Mark last message seen by current user
  markSeen: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input, c }) => {
      await ensureUserInConversation(input.conversationId, ctx.user.id)

      const conversation = await db.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          users: { select: { id: true, email: true, name: true } },
          messages: {
            include: { sender: { select: { id: true, email: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      })
      if (!conversation) throw new HTTPException(404, { message: "[CONVERSATION_NOT_FOUND]" })

      const lastMessage = conversation.messages.at(-1)
      if (!lastMessage) {
        return c.superjson({ conversation })
      }

      // If already seen by me, return updated conversation unchanged
      if (lastMessage.seenIds.includes(ctx.user.id)) {
        return c.superjson({ conversation })
      }

      // Update seenIds array
      await db.message.update({
        where: { id: lastMessage.id },
        data: { 
          seenIds: { push: ctx.user.id } // Add user to seenIds array
        },
      })

      // Reload to get updated conversation
      const updatedConversation = await db.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          users: { select: { id: true, email: true, name: true } },
          messages: {
            include: { sender: { select: { id: true, email: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      })

      if (!updatedConversation) throw new HTTPException(404, { message: "[CONVERSATION_NOT_FOUND]" })

      // Realtime notify
      if (ctx.user.email) {
        await pusherServer.trigger(ctx.user.email, "conversation:update", {
          id: input.conversationId,
          conversation: updatedConversation,
        })
      }
      await pusherServer.trigger(input.conversationId, "conversation:update", updatedConversation)

      return c.superjson({ conversation: updatedConversation })
    }),

  // Delete a conversation
  deleteConversation: privateProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input, c }) => {
      await ensureUserInConversation(input.conversationId, ctx.user.id)

      await db.$transaction(async (tx) => {
        await tx.message.deleteMany({ where: { conversationId: input.conversationId } })
        await tx.conversation.delete({ where: { id: input.conversationId } })
      })

      await pusherServer.trigger(input.conversationId, "conversation:deleted", { id: input.conversationId })
      return c.superjson({ success: true })
    }),
})