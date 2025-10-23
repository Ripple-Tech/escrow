import { NextResponse } from "next/server";
import { resolveAccount } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const { bankCode, accountNumber } = await req.json();
    if (!bankCode || !accountNumber) {
      return new NextResponse("Missing bankCode or accountNumber", { status: 400 });
    }
    const result = await resolveAccount(bankCode, accountNumber);
    return NextResponse.json(result);
  } catch (e: any) {
    return new NextResponse(e.message || "Failed to resolve account", { status: 500 });
  }
}