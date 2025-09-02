import { z } from "zod"

export const ESCROW_ROLE = z.enum(["SELLER", "BUYER"])
export const ESCROW_STATUS = z.enum(["PENDING", "RELEASED", "CANCELLED"])

export const ESCROW_VALIDATOR = z
  .object({
    productName: z.string().min(1, "Product name is required."),
    description: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be greater than 0."),
    currency: z.string().min(2).max(5),
    status: ESCROW_STATUS.default("PENDING"),
    role: ESCROW_ROLE.default("SELLER"),
    receiverEmail: z.string().email("Invalid receiver email."),
    receiverId: z.string().cuid("Invalid receiver ID.").optional(),
  })
  .refine((data) => !data.receiverId || data.receiverId.length > 0, {
    message: "Invalid receiver ID.",
    path: ["receiverId"],
  })