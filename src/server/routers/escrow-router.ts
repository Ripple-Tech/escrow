import { db } from "@/db"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { ESCROW_VALIDATOR } from "@/lib/validators/escrow-validator"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

export const escrowRouter = router({
  createEscrow: privateProcedure
    .input(ESCROW_VALIDATOR)
    .mutation(async ({ ctx, input, c }) => {
      // Prevent same user if receiverId provided and equals sender
      if (input.receiverId && input.receiverId === ctx.user.id) {
        throw new HTTPException(400, {
          message: "Sender and receiver cannot be the same user.",
        })
      }

      // Determine invited role based on creator's role
      // Default to "SELLER" if not provided to keep prior behavior
      const creatorRole = (input.role ?? "SELLER") as "SELLER" | "BUYER"
      const invitedRole = creatorRole === "SELLER" ? "BUYER" : "SELLER"

      const escrow = await db.escrow.create({
        data: {
          userId: ctx.user.id,
          senderId: ctx.user.id,
          senderEmail: input.senderEmail ?? ctx.user.email,
          
          // Product core
          productName: input.productName,
          description: input.description,
          creatorId: ctx.user.id,
          // Money
          amount: input.amount,
          currency: input.currency,

          // State
          status: (input.status as any) ?? "PENDING",
          role: creatorRole,

          // Receiver (optional until accepted)
          receiverId: input.receiverId ?? undefined,
          receiverEmail: input.receiverEmail,

          // New fields (optional fallbacks)
          source: (input.source as any) ?? "INTERNAL",
          invitationStatus: "PENDING",
          invitedRole,

          logistics: (input.logistics as any) ?? "NO",
          photoUrl: input.photoUrl ?? undefined,
          color: input.color ?? undefined,
          category: input.category ?? undefined,
          quantity: input.quantity ?? undefined,
        },
      })
      
      // 🔥 Add the activity right after escrow is created
await db.escrowActivity.create({
  data: {
    escrowId: escrow.id,
    userId: ctx.user.id,
    action: "CREATED",
  },
})

      return c.superjson({ escrow })
    }),

  getEscrows: privateProcedure.query(async ({ ctx, c }) => {
    const escrows = await db.escrow.findMany({
      where: { OR: [{ senderId: ctx.user.id }, { receiverId: ctx.user.id }] },
      orderBy: { createdAt: "desc" },
    })
    return c.superjson({ escrows })
  }),

  deleteEscrow: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ c, input, ctx }) => {
      await db.escrow.delete({
        where: { id: input.id, senderId: ctx.user.id },
      })
      return c.superjson({ success: true })
    }),

  getEscrowById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input, c }) => {
      const { id } = input

      const escrow = await db.escrow.findFirst({
        where: {
          id,
          OR: [{ senderId: ctx.user.id }, { receiverId: ctx.user.id }],
        },
        include: {
          sender: { select: { id: true, email: true } },
          receiver: { select: { id: true, email: true } },
        },
      })

      if (!escrow) {
        throw new HTTPException(404, {
          message: "Escrow not found or you do not have access.",
        })
      }

      return c.superjson({ escrow })
    }),

  // acceptEscrow procedure
acceptEscrow: privateProcedure
.input(z.object({ escrowId: z.string().min(1) }))
.mutation(async ({ ctx, input, c }) => {
const escrow = await db.escrow.findUnique({
where: { id: input.escrowId },
include: {
sender: { select: { id: true, email: true } },
receiver: { select: { id: true, email: true } },
},
})

if (!escrow) {
  throw new HTTPException(404, { message: "Escrow not found" })
}

if (escrow.senderId === ctx.user.id) {
  throw new HTTPException(403, { message: "Sender cannot accept own escrow." })
}

// If already accepted by same user, ensure idempotency fields are correct
if (escrow.receiverId && escrow.receiverId === ctx.user.id) {
  if (escrow.invitationStatus !== "ACCEPTED" || !escrow.invitedRole) {
    const oppositeRole = escrow.role === "SELLER" ? "BUYER" : "SELLER"
    await db.escrow.update({
      where: { id: input.escrowId },
      data: {
        invitationStatus: "ACCEPTED",
        invitedRole: oppositeRole,
      },
    })
  }
  
// 🔥 Add the activity right after escrow is Accepted
  await db.escrowActivity.create({
  data: {
    escrowId: escrow.id,
    userId: ctx.user.id,
    action: "ACCEPTED",
  },
})

  return c.superjson({ success: true, escrowId: escrow.id })
}

if (escrow.receiverId && escrow.receiverId !== ctx.user.id) {
  throw new HTTPException(409, { message: "Escrow already accepted by another user." })
}

const user = await db.user.findUnique({
  where: { id: ctx.user.id },
  select: { id: true, email: true },
})
if (!user) {
  throw new HTTPException(404, { message: "User not found" })
}

const oppositeRole = escrow.role === "SELLER" ? "BUYER" : "SELLER"

await db.escrow.update({
  where: { id: input.escrowId },
  data: {
    receiverId: ctx.user.id,
    receiverEmail: escrow.receiverEmail ?? user.email ?? "",
    invitationStatus: "ACCEPTED",
    invitedRole: oppositeRole,
    // keep status as PENDING (your schema has no ACCEPTED in EscrowStatus)
  },
})

return c.superjson({ success: true, escrowId: escrow.id })
}),


declineEscrow: privateProcedure
    .input(z.object({ escrowId: z.string().min(1) }))
    .mutation(async ({ ctx, input, c }) => {
      const escrow = await db.escrow.findUnique({
        where: { id: input.escrowId },
        select: { id: true, senderId: true, receiverId: true, invitationStatus: true },
      })

      if (!escrow) {
        throw new HTTPException(404, { message: "Escrow not found" })
      }

      if (escrow.senderId === ctx.user.id) {
        throw new HTTPException(403, { message: "Sender cannot decline own escrow." })
      }

      // If already accepted by someone, cannot decline
      if (escrow.receiverId && escrow.receiverId !== ctx.user.id) {
        throw new HTTPException(409, { message: "Escrow already accepted by another user." })
      }

      // Mark as declined. Do not set receiverId.
      await db.escrow.update({
        where: { id: input.escrowId },
        data: {
          invitationStatus: "DECLINED",
        },
      })

      return c.superjson({ success: true, escrowId: escrow.id })
    }),


})