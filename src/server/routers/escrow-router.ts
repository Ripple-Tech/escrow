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
          message: "[SENDER_RECEIVER_SAME] Sender and receiver cannot be the same user.",
        })
      }

      const creatorRole = (input.role ?? "SELLER") as "SELLER" | "BUYER"
      const invitedRole = creatorRole === "SELLER" ? "BUYER" : "SELLER"

      // Simple amount parsing & validate
      const amountNum = Number(input.amount)
      if (Number.isNaN(amountNum) || amountNum <= 0) {
        throw new HTTPException(400, { message: "Invalid escrow amount." })
      }
      // Use integer balances for now (rounding to nearest integer)
      const amountInt = Math.round(amountNum)

      // Use interactive transaction to ensure atomicity
      const createdEscrow = await db.$transaction(async (tx) => {
        const escrow = await tx.escrow.create({
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

        // Activity
        await tx.escrowActivity.create({
          data: {
            escrowId: escrow.id,
            userId: ctx.user.id,
            action: "CREATED",
          },
        })

        // If creator is BUYER -> lock funds immediately
        if (creatorRole === "BUYER") {
          // Load buyer balance
          const buyer = await tx.user.findUnique({
            where: { id: ctx.user.id },
            select: { id: true, balance: true },
          })
          if (!buyer) {
            throw new HTTPException(404, { message: "User not found." })
          }
          if (buyer.balance < amountInt) {
            throw new HTTPException(400, {
               message: "[INSUFFICIENT_FUNDS] Insufficient balance. Please top up your account to accept this escrow.",
            })
          }

          // decrement buyer balance and create Lockedfund
          await tx.user.update({
            where: { id: ctx.user.id },
            data: { balance: { decrement: amountInt } },
          })

          await tx.lockedfund.create({
            data: {
              escrowId: escrow.id,
              buyerId: ctx.user.id,
              amount: input.amount, // keep as Decimal (Prisma will accept string/number)
            },
          })
        }

        return escrow
      })

      // Refetch with relations to return (include lockedfund)
      const escrowWithRelations = await db.escrow.findUnique({
        where: { id: createdEscrow.id },
        include: {
          sender: { select: { id: true, email: true } },
          receiver: { select: { id: true, email: true } },
          activities: {
            include: { user: { select: { id: true, email: true, name: true } } },
            orderBy: { createdAt: "desc" },
          },
          lockedfund: true,
        },
      })

      return c.superjson({ escrow: escrowWithRelations })
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
          activities: {
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          // <<-- include locked fund so client can display it
          lockedfund: {
            include: { buyer: { select: { id: true, email: true } } },
          },
        },
      })

      if (!escrow) {
        throw new HTTPException(404, {
          message: "[ESCROW_NOT_FOUND] Escrow not found or you do not have access.",
        })
      }

      return c.superjson({ escrow })
    }),






  // acceptEscrow procedure (updated to lock funds if accepter is the buyer)
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
      throw new HTTPException(404, { 
        message: "[ESCROW_NOT_FOUND] Escrow not found" })
    }

    if (escrow.senderId === ctx.user.id) {
      throw new HTTPException(403, { message: "[SENDER_CANNOT_ACCEPT] Sender cannot accept own escrow." })
    }

    // If already accepted
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
      return c.superjson({ success: true, escrowId: escrow.id })
    }

    if (escrow.receiverId && escrow.receiverId !== ctx.user.id) {
      throw new HTTPException(409, { 
        message: "[ESCROW_ALREADY_ACCEPTED] Escrow already accepted by another user." })
    }

    const user = await db.user.findUnique({
      where: { id: ctx.user.id },
      select: { id: true, email: true, balance: true },
    })

    if (!user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const oppositeRole = escrow.role === "SELLER" ? "BUYER" : "SELLER"

    // 🛑 If the opposite role is BUYER, that means current user must pay
if (oppositeRole === "BUYER") {
  const amountKobo = Number(escrow.amount) * 100;

  if (user.balance < amountKobo) {
    throw new HTTPException(400, {
      message: "[INSUFFICIENT_FUNDS] Insufficient balance. Please top up your account to accept this escrow.",
    })
  }

  // Deduct balance + lock fund (all in kobo)
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { balance: { decrement: amountKobo } },
    }),
    db.lockedfund.create({
      data: {
        escrowId: escrow.id,
        buyerId: user.id,
        amount: amountKobo, // store in kobo
      },
    }),
  ])
}

    const updated = await db.escrow.update({
      where: { id: input.escrowId },
      data: {
        receiverId: ctx.user.id,
        receiverEmail: escrow.receiverEmail ?? user.email ?? "",
        invitationStatus: "ACCEPTED",
        invitedRole: oppositeRole,
      },
    })

    await db.escrowActivity.create({
      data: {
        escrowId: updated.id,
        userId: ctx.user.id,
        action: "ACCEPTED",
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



  // releaseEscrow: buyer releases locked funds to the seller
  releaseEscrow: privateProcedure
  .input(z.object({ escrowId: z.string().min(1) }))
  .mutation(async ({ ctx, input, c }) => {
    const locked = await db.lockedfund.findUnique({
      where: { escrowId: input.escrowId },
      include: { escrow: true },
    })
    if (!locked) throw new HTTPException(404, { message: "No locked funds found for this escrow." })
    if (locked.released) throw new HTTPException(400, { message: "Funds already released." })
    if (locked.buyerId !== ctx.user.id) throw new HTTPException(403, { message: "Only the buyer can release funds." })

    const escrow = await db.escrow.findUnique({
      where: { id: input.escrowId },
      include: { sender: true, receiver: true },
    })
    if (!escrow) throw new HTTPException(404, { message: "Escrow not found." })

    // ✅ derive seller
    const sellerId = escrow.role === "SELLER" ? escrow.senderId : escrow.receiverId
    if (!sellerId) throw new HTTPException(400, { message: "Escrow has no seller to receive funds." })

    const amountInt = Math.round(Number(locked.amount))
    if (!amountInt || amountInt <= 0) throw new HTTPException(400, { message: "Invalid locked amount." })

    await db.$transaction([
      db.lockedfund.update({
        where: { escrowId: input.escrowId },
        data: { released: true },
      }),
      db.escrow.update({
        where: { id: input.escrowId },
        data: { status: "RELEASED" },
      }),
      db.user.update({
        where: { id: sellerId },
        data: { balance: { increment: amountInt } },
      }),
      db.escrowActivity.create({
        data: {
          escrowId: input.escrowId,
          userId: ctx.user.id,
          action: "RELEASED",
        },
      }),
    ])

    return c.superjson({ success: true })
  }),



})
