import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import getCurrentUser from "@/actions/getCurrentUser"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { transferReference, otp } = await req.json()

    if (!transferReference || !otp) {
      return NextResponse.json(
        { error: "Transfer reference and OTP are required" },
        { status: 400 }
      )
    }

    // Finalize transfer with OTP
    const finalizeResponse = await fetch("https://api.paystack.co/transfer/finalize_transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transfer_code: transferReference,
        otp: otp,
      }),
    })

    const finalizeData = await finalizeResponse.json()

    if (!finalizeData.status) {
      return NextResponse.json(
        { error: finalizeData.message || "OTP verification failed" },
        { status: 400 }
      )
    }

    // Update transaction status
    await db.transaction.updateMany({
      where: {
        paystackReference: transferReference,
        userId: user.id,
        status: "REQUIRES_OTP"
      },
      data: {
        status: "PROCESSING",
        verificationMeta: {
          finalizeData: finalizeData.data
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Transfer approved successfully",
      data: finalizeData.data
    })

  } catch (error: any) {
    console.error("OTP approval error:", error)
    return NextResponse.json(
      { error: "Failed to approve transfer" },
      { status: 500 }
    )
  }
}