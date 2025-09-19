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

      const escrow = await db.escrow.create({
        data: {
          userId: ctx.user.id,
          senderId: ctx.user.id,
          productName: input.productName,
          description: input.description,
          amount: input.amount,
          currency: input.currency,
          status: input.status ?? "PENDING",
          role: input.role ?? "SELLER",
          receiverId: input.receiverId ?? undefined, // keep null if not provided
          receiverEmail: input.receiverEmail,
        },
      })

      return c.superjson({ escrow })
    }),

  getEscrows: privateProcedure.query(async ({ ctx, c }) => {
    const escrows = await db.escrow.findMany({
      where: { senderId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    })
    return c.superjson({ escrows })
  }),

  deleteEscrow: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ c, input, ctx }) => {
      const { id } = input

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
        OR: [
          { senderId: ctx.user.id },
          { receiverId: ctx.user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!escrow) {
      throw new HTTPException(404, {
        message: "Escrow not found or you do not have access.",
      })
    }

    return c.superjson({ escrow })
  }),



})
