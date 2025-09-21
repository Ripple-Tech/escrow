// app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs"; // ensure Node runtime for crypto

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  try {
    // 1) Read raw body FIRST (no prior parsing!)
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // 2) Verify HMAC-SHA512
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY missing");
      return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
    }
    const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (!timingSafeEqual(computed, signature)) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const type = event?.event;
    const ref: string | undefined = event?.data?.reference;
    const paidAmountKobo: number | undefined = event?.data?.amount; // Paystack sends amount in kobo

    console.log("Paystack webhook:", type, ref);

    if (!ref) {
      return NextResponse.json({ error: "missing reference" }, { status: 400 });
    }

    if (type === "charge.success") {
      // Load transaction
      const tx = await db.transaction.findUnique({ where: { reference: ref } });
      if (!tx) {
        console.error("Transaction not found:", ref);
        return NextResponse.json({ error: "transaction not found" }, { status: 404 });
      }

      // Idempotency: only credit once
      if (tx.status === "SUCCESS") {
        console.log("Transaction already processed:", ref);
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // Amount consistency check
      const expectedKobo = Math.round(tx.amount * 100);
      if (typeof paidAmountKobo === "number" && paidAmountKobo !== expectedKobo) {
        console.warn(`Amount mismatch for ${ref}. expected=${expectedKobo} got=${paidAmountKobo}`);
        return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
      }

      // Atomic update: set SUCCESS and increment balance
      await db.$transaction(async (txdb) => {
        await txdb.transaction.update({
          where: { reference: ref },
          data: { status: "SUCCESS" },
        });

        // Read current user balance
        const user = await txdb.user.findUnique({
          where: { id: tx.userId },
          select: { id: true, balance: true },
        });
        if (!user) throw new Error("User not found for transaction " + ref);

        const increment = expectedKobo; // or paidAmountKobo if you trust Paystack amount
        await txdb.user.update({
          where: { id: user.id },
          data: { balance: (user.balance ?? 0) + increment },
        });
      });

      // Non-critical UI refresh
      try {
        revalidatePath("/dashboard");
      } catch (e) {
        console.warn("revalidatePath failed:", e);
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (type === "charge.failed") {
      // Mark failed if not already set
      await db.transaction.updateMany({
        where: { reference: ref, status: { not: "SUCCESS" } },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Acknowledge unhandled events to avoid retries
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}