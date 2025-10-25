// // app/api/paystack-callback/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto';
// import { db } from '@/db';

// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// export async function POST(req: NextRequest) {
//   // Read the raw body
//   const rawBody = await req.text();
//   const signature = req.headers.get('x-paystack-signature') || '';

//   // Ensure secret key is defined
//   if (!PAYSTACK_SECRET_KEY) {
//     return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
//   }

//   // Verify the signature
//   const computed = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
//   if (computed !== signature) {
//     return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
//   }

//   const event = JSON.parse(rawBody);
//   const type = event?.event;
//   const ref = event?.data?.reference;
//   const paidAmountKobo = event?.data?.amount; // Amount in kobo

//   if (!ref) {
//     return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
//   }

//   if (type === 'charge.success') {
//     // Load transaction
//     const tx = await db.transaction.findUnique({ where: { reference: ref } });
//     if (!tx) {
//       console.error("Transaction not found:", ref);
//       return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
//     }

//     // Check if already processed
//     if (tx.status === 'SUCCESS') {
//       console.log("Transaction already processed:", ref);
//       return NextResponse.json({ ok: true }, { status: 200 });
//     }

//     // Update transaction and user balance
//     const expectedKobo = Math.round(tx.amount * 100);
//     if (paidAmountKobo !== expectedKobo) {
//       console.warn(`Amount mismatch for ${ref}. expected=${expectedKobo} got=${paidAmountKobo}`);
//       return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
//     }

//     await db.$transaction(async (txdb) => {
//       await txdb.transaction.update({
//         where: { reference: ref },
//         data: { status: 'SUCCESS' },
//       });

//       const user = await txdb.user.findUnique({
//         where: { id: tx.userId },
//         select: { id: true, balance: true },
//       });
//       if (!user) throw new Error("User not found for transaction " + ref);

//       await txdb.user.update({
//         where: { id: user.id },
//         data: { balance: (user.balance ?? 0) + expectedKobo },
//       });
//     });

//     return NextResponse.json({ ok: true }, { status: 200 });
//   }

//   if (type === 'charge.failed') {
//     await db.transaction.updateMany({
//       where: { reference: ref, status: { not: 'SUCCESS' } },
//       data: { status: 'FAILED' },
//     });
//     return NextResponse.json({ ok: true }, { status: 200 });
//   }

//   return NextResponse.json({ ok: true }, { status: 200 });
// }