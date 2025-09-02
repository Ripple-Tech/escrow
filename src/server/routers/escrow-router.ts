import { db } from "@/db"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { ESCROW_VALIDATOR } from "@/lib/validators/escrow-validator"
import { HTTPException } from "hono/http-exception"

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
})