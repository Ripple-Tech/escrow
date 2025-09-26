import { db } from "@/db"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { z } from "zod"
import { HTTPException } from "hono/http-exception"

// Validators (optional runtime shape)
const TRANSACTION_VALIDATOR = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["DEPOSIT", "WITHDRAW", "TRANSFER"]),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
  reference: z.string(),
  amount: z.number(),
  currency: z.enum(["NGN", "USD", "GHS"]),
  direction: z.enum(["DEBIT", "CREDIT"]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const transactionRouter = router({
  // Fetch all transactions for logged-in user
  listTransactions: privateProcedure.query(async ({ ctx, c }) => {
    const transactions = await db.transaction.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    })
    return c.superjson({ transactions })
  }),

  // Fetch a single transaction by id (only if belongs to user)
  getTransaction: privateProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input, c }) => {
      const tx = await db.transaction.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      })
      if (!tx) throw new HTTPException(404, { message: "Transaction not found" })
      return c.superjson({ transaction: tx })
    }),

  // Optional: create a transaction manually (normally automated after payment/escrow events)
  createTransaction: privateProcedure
    .input(
      z.object({
        type: z.enum(["DEPOSIT", "WITHDRAW", "TRANSFER"]),
        amount: z.number().positive(),
        currency: z.enum(["NGN", "USD", "GHS"]),
        reference: z.string(),
        direction: z.enum(["DEBIT", "CREDIT"]),
      })
    )
    .mutation(async ({ ctx, input, c }) => {
      const created = await db.transaction.create({
        data: {
          userId: ctx.user.id,
          type: input.type,
          amount: input.amount,
          currency: input.currency,
          reference: input.reference,
          direction: input.direction,
          status: "SUCCESS", // or start as PENDING if needed
        },
      })
      return c.superjson({ transaction: created })
    }),
})