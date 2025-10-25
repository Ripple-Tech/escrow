import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import getCurrentUser from "@/actions/getCurrentUser"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentMethods = await db.paymentMethod.findMany({
      where: {
        userId: user.id,
        status: "VERIFIED", // Only show verified payment methods
      },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        accountName: true,
        isDefault: true,
        bankCode: true,
      },
      orderBy: {
        isDefault: 'desc',
        createdAt: 'desc',
      },
    })

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error("Failed to fetch payment methods:", error)
    return NextResponse.json(
      { error: "Failed to load payment methods" },
      { status: 500 }
    )
  }
}