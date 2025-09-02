import { db } from "@/db"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ESCROW_VALIDATOR } from "@/lib/validators/escrow-validator"

export const runtime = "nodejs"

export const POST = async (req: NextRequest) => {
  try {
    // Optional API key support; you can remove this block if not needed
    const authHeader = req.headers.get("Authorization")

    // Resolve current app user via Clerk or API key
    let appUser: { id: string } | null = null

    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.split(" ")[1]
      const userByApiKey = await db.user.findUnique({
        where: { apiKey },
        select: { id: true },
      })
      if (userByApiKey) {
        appUser = { id: userByApiKey.id }
      }
    }

    if (!appUser) {
      const { currentUser } = await import("@clerk/nextjs/server")
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }
      // Map Clerk user to your app user
      const user = await db.user.findUnique({
        where: { externalId: clerkUser.id },
        select: { id: true },
      })
      if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }
      appUser = { id: user.id }
    }

    let requestData: unknown
    try {
      requestData = await req.json()
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
    }

    const input = ESCROW_VALIDATOR.parse(requestData)

    // Prevent same user if receiverId provided and equals sender
    if (input.receiverId && input.receiverId === appUser.id) {
      return NextResponse.json(
        { message: "Sender and receiver cannot be the same user." },
        { status: 400 }
      )
    }

    const escrow = await db.escrow.create({
      data: {
        userId: appUser.id,
        senderId: appUser.id, // enforce authenticated user as sender
        productName: input.productName,
        description: input.description,
        amount: input.amount, // Prisma will store as Decimal
        currency: input.currency,
        status: input.status ?? "PENDING",
        role: input.role ?? "SELLER",
        receiverId: input.receiverId ?? undefined, // omit when undefined -> null in DB
        receiverEmail: input.receiverEmail,
      },
    })

    return NextResponse.json({
      message: "Escrow created successfully",
      escrowId: escrow.id,
    })
  } catch (err) {
    console.error(err)
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", issues: err.issues },
        { status: 422 }
      )
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}