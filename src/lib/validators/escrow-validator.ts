import { release } from "os"
import { z } from "zod"

// Existing enums
export const ESCROW_ROLE = z.enum(["SELLER", "BUYER"])
export const ESCROW_STATUS = z.enum(["PENDING", "RELEASED", "CANCELLED"])

// New enums (match Prisma)
export const ESCROW_SOURCE = z.enum(["INTERNAL", "API"]).default("INTERNAL")
export const ESCROW_INVITATION_STATUS = z
  .enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"])
  .default("PENDING")
export const LOGISTICS_OPTION = z.enum(["NO", "PICKUP", "DELIVERY"]).default("NO")
export const CURRENCY_ENUM = z.enum(["NGN", "USD", "GHS"]);

// lockedFund validator
export const LOCKED_FUND_VALIDATOR = z.object({
  id: z.string(),
  amount: z.coerce.number(),
  released: z.boolean(),
  buyerId: z.string(),
  buyer: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
})

export const ESCROW_VALIDATOR = z
  .object({
    // Core fields (unchanged)
    currency: CURRENCY_ENUM,
    productName: z.string().min(1, "Product name is required."),
    description: z.string().optional(),
    amount: z.coerce.number().int("Amount must be a whole number.").positive("Amount must be greater than 0."),
    status: ESCROW_STATUS.default("PENDING"),
    senderEmail: z.string().email("Invalid sender email.").optional(),
    role: ESCROW_ROLE.default("SELLER"),
    receiverId: z.string().cuid("Invalid receiver ID.").optional(),
    lockedfund: LOCKED_FUND_VALIDATOR.optional(),
    // New optional fields
    source: ESCROW_SOURCE.optional(), // server defaults to INTERNAL if omitted
    logistics: LOGISTICS_OPTION.optional(), // server defaults to NO if omitted
    receiverEmail: z.string().email("Invalid receiver email.").optional(),
   
    photoUrl: z.string().url().optional().or(z.literal("")),

    color: z.string().optional(),
    category: z.string().optional(),
    quantity: z.coerce.number().int().positive().optional(),

    // Invitation fields (server may compute invitedRole; keep optional for flexibility)
    invitedRole: ESCROW_ROLE.optional(),
    invitationStatus: ESCROW_INVITATION_STATUS.optional(),
  })
  .refine((data) => !data.receiverId || data.receiverId.length > 0, {
    message: "Invalid receiver ID.",
    path: ["receiverId"],
  })