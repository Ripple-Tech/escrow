"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import PaymentClientPage from "./paymentClient";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id || null;

  let userHasBvn = false;
  if (userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { bvnhash: true },
    });
    userHasBvn = Boolean(user?.bvnhash);
  }

  return (
    
      <PaymentClientPage userHasBvn={userHasBvn} />
  
  );
};

export default Page;