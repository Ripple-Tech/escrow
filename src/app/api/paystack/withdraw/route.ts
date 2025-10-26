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
        status: "PENDING_APPROVAL", // Changed to pending approval
        reference,
        amount,
        direction: "DEBIT",
        currency: "NGN",
        paymentMethodId: paymentMethod.id,
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

    // Step 1: First create a transfer recipient
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: paymentMethod.accountName,
        account_number: paymentMethod.accountNumber,
        bank_code: paymentMethod.bankCode,
        currency: "NGN",
      }),
    })

    const recipientData = await recipientResponse.json()

    if (!recipientData.status) {
      // If recipient creation fails, refund the user
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
        { error: recipientData.message || "Failed to create transfer recipient" },
        { status: 400 }
      )
    }

    const recipientCode = recipientData.data.recipient_code

    // Step 2: Initiate transfer with OTP requirement
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100,
        reference,
        recipient: recipientCode,
        reason: "Withdrawal from wallet",
      }),
    })

    const transferData = await transferResponse.json()

    // If transfer requires OTP approval
    if (transferData.status === false && transferData.message?.includes("OTP")) {
      // Store transfer data for OTP verification
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "REQUIRES_OTP",
          paystackReference: transferData.data?.reference,
          verificationMeta: { 
            transferData: transferData.data,
            recipientCode,
            requiresOtp: true
          }
        }
      })

      return NextResponse.json({
        success: true,
        requiresOtp: true,
        message: "Transfer requires OTP approval",
        reference: transferData.data?.reference,
        transferReference: transferData.data?.reference
      })
    }

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
        status: "PROCESSING",
        paystackReference: transferData.data.reference,
        verificationMeta: { 
          transferData: transferData.data,
          recipientCode
        }
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