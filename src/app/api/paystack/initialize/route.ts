import { useCallback } from 'react';
// app/api/deposit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db" 
import { v4 as uuidv4 } from "uuid"
import  getCurrentUser from "@/actions/getCurrentUser"

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    const { amount } = await req.json()

    const userId = user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // (2) Create transaction in DB
    const reference = `DEP_${uuidv4()}`
    const transaction = await db.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        status: "PENDING",
        reference,
        amount,
        currency: "NGN",
      },
    })

    // (3) Call Paystack initialize
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user?.email, 
        amount: amount * 100, // Paystack expects kobo
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-success`, // optional
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json(
        { error: "Failed to initialize Paystack transaction" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      paymentUrl: data.data.authorization_url,
      reference,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
