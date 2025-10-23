import { NextResponse } from "next/server";
import { db } from "@/db";
import { listBanksNGN } from "@/lib/paystack";

export async function GET() {
  try {
    // optional: refresh cache each call; or add TTL
    const banks = await listBanksNGN();

    // upsert into DB cache
    await Promise.all(
      banks.map(b =>
        db.bank.upsert({
          where: { code_currency: { code: b.code, currency: "NGN" } },
          create: {
            name: b.name,
            code: b.code,
            country: "NG",
            currency: "NGN",
            active: true,
          },
          update: {
            name: b.name,
            active: true,
          },
        })
      )
    );

    return NextResponse.json(banks);
  } catch (e: any) {
    return new NextResponse(e.message || "Failed to fetch banks", { status: 500 });
  }
}