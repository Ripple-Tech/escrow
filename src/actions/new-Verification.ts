"use server";
import { db } from "@/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token"

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return {error: "Token does not exist!"};
    }
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return {error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);
    //console.log('existingUser:', existingUser);
    if(!existingUser) {
        return {error: "Email does not exist!"};
    }

   const verifiedUser =  await db.user.update({
        where: {id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.email
        }
    });

     // ✅ Check if user was invited by someone
  if (verifiedUser.invitedById) {
    await db.user.update({
      where: { id: verifiedUser.invitedById },
      data: {
        ledgerbalance: { increment: 500 }, // 🎁 inviter gets ₦500 only now
      },
    });
}
  await db.verificationToken.delete({
     where: {id: existingToken.id}
  });
  return {success: "Email verified!"}
}