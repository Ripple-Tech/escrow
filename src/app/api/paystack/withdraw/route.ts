import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { v4 as uuidv4 } from "uuid"
import getCurrentUser from "@/actions/getCurrentUser"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { amount, paymentMethodId } = await req.json()

    // Validate input
    if (!amount || !paymentMethodId) {
      return NextResponse.json(
        { error: "Amount and payment method are required" },
        { status: 400 }
      )
    }

    // Check user balance
    const userAccount = await db.user.findUnique({
      where: { id: user.id },
      select: { balance: true, ledgerbalance: true }
    })

    if (!userAccount || userAccount.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Get payment method details
    const paymentMethod = await db.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id
      }
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }

    if (!paymentMethod.accountNumber || !paymentMethod.bankCode) {
      return NextResponse.json(
        { error: "Payment method missing required details" },
        { status: 400 }
      )
    }

    // Create withdrawal transaction
    const reference = `WTH_${uuidv4()}`
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        type: "WITHDRAWAL",
        status: "PENDING",
        reference,
        amount,
        direction: "DEBIT",
        currency: "NGN",
      },
    })

    // Reserve the amount by updating user balance
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: { decrement: amount },
        ledgerbalance: { decrement: amount }
      }
    })

    // Initialize Paystack transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100, // Paystack expects kobo
        reference,
        recipient: paymentMethod.accountNumber,
        reason: "Withdrawal",
        bank_code: paymentMethod.bankCode,
        account_number: paymentMethod.accountNumber,
        currency: "NGN",
      }),
    })

    const transferData = await transferResponse.json()

    if (!transferData.status) {
      // If Paystack transfer fails, refund the user
      await db.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: amount },
          ledgerbalance: { increment: amount }
        }
      })

      await db.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" }
      })

      return NextResponse.json(
        { error: transferData.message || "Transfer failed. Please try again." },
        { status: 400 }
      )
    }

    // Update transaction with Paystack reference
    await db.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "PENDING",
        reference: transferData.data.reference,
        direction: "DEBIT",
      }
    })

    return NextResponse.json({
      success: true,
      message: "Withdrawal initiated successfully",
      reference,
      transferReference: transferData.data.reference
    })

  } catch (error: any) {
    console.error("Withdrawal error:", error)
    
    // Refund user in case of unexpected errors
    try {
      const { amount } = await req.json().catch(() => ({}))
      if (amount && user) {
        await db.user.update({
          where: { id: user.id },
          data: {
            balance: { increment: amount },
            ledgerbalance: { increment: amount }
          }
        })
      }
    } catch (refundError) {
      console.error("Refund failed:", refundError)
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    )
  }
}