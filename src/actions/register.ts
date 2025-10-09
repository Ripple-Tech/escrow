"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import { db } from "@/db";
import { getUserByEmail, getUserByUsername } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

type RegisterPayload = z.infer<typeof RegisterSchema> & {
  referralUsername?: string | undefined;
};

export const Register = async (values: RegisterPayload) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, surname, username, phonenumber, password, name } = validatedFields.data;
  const referralUsername = values.referralUsername?.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  // Check for duplicates
  const existingUser = await getUserByEmail(email);
  if (existingUser) return { error: "Email already in use!" };

  const existingByUsername = await getUserByUsername(normalizedUsername);
  if (existingByUsername) return { error: "Username already taken!" };

  const hashedPassword = await bcrypt.hash(password, 10);

  // Optional: resolve inviter if referralUsername provided
  let inviter = null;
  if (referralUsername && referralUsername !== normalizedUsername) {
    inviter = await getUserByUsername(referralUsername);
  }

  try {
    // ✅ Start a transaction to safely handle both user creation and referral reward
    const newUser = await db.$transaction(async (tx) => {
      // 1️⃣ Create new user (User B)
      const createdUser = await tx.user.create({
        data: {
          name,
          surname,
          email,
          phonenumber,
          username: normalizedUsername,
          password: hashedPassword,
          ledgerbalance: 500, // 🎁 new user gets ₦500 bonus
          ...(inviter?.id ? { invitedById: inviter.id } : {}),
        },
      });

      // 2️⃣ If inviter exists, credit their ledger balance
      if (inviter?.id) {
        await tx.user.update({
          where: { id: inviter.id },
          data: {
            ledgerbalance: { increment: 500 }, // 🎁 inviter gets ₦500 in ledger
          },
        });
      }

      return createdUser;
    });

    // 3️⃣ Generate verification token
    const verificationToken = await generateVerificationToken(email);

    // 4️⃣ Send verification email
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: "Verification email sent" };
  } catch (e: any) {
    // Handle Prisma unique constraint edge cases
    if (e?.code === "P2002" && Array.isArray(e?.meta?.target)) {
      if (e.meta.target.includes("username")) {
        return { error: "Username already taken!" };
      }
      if (e.meta.target.includes("email")) {
        return { error: "Email already in use!" };
      }
    }

    console.error("Registration error:", e);
    return { error: "Failed to create account" };
  }
};





// "use server";
// import bcrypt from "bcryptjs"
// import * as z from "zod";
// import { RegisterSchema } from "@/schemas";
// import {db} from "@/db"
// import { getUserByEmail, getUserByUsername } from "@/data/user";
// import { generateVerificationToken } from "@/lib/tokens";
// import { sendVerificationEmail } from "@/lib/mail"

// export const Register = async (values: z.infer<typeof RegisterSchema>) => {
//     const validatedFields = RegisterSchema.safeParse(values);

//     if (!validatedFields.success) {
//         return { error: "Invalid fields!"};
//     }

//     const { email, surname, username, phonenumber, password, name } = validatedFields.data;
//     const hashedPassword = await bcrypt.hash(password, 10)
//     const normalizedUsername = username.trim().toLowerCase();
//     const existingUser = await getUserByEmail(email)

//     if (existingUser) {
//         return {error: "Email already in use!"};
//     }
//     // Check username uniqueness
// if (normalizedUsername) {
// const existingByUsername = await getUserByUsername(normalizedUsername);
// if (existingByUsername) {
// return { error: "Username already taken!" };
// }
// }
//      try {
//     await db.user.create({
//         data: {
//             name, email, surname, phonenumber, username: normalizedUsername, password: hashedPassword,
             
//         },
//     });
// } catch (e: any) {
//     // Handle race-condition duplicate (Prisma unique constraint)
// if (e?.code === "P2002" && Array.isArray(e?.meta?.target)) {
// if (e.meta.target.includes("username")) {
// return { error: "Username already taken!" };
// }
// if (e.meta.target.includes("email")) {
// return { error: "Email already in use!" };
// }
// }
// return { error: "Failed to create user" };
// }

// // Generate email verification token
//     const verificationToken = await generateVerificationToken(email);
// // Send verification email
// try {
//     await sendVerificationEmail(verificationToken.email, verificationToken.token);
//     return { success: "Verification email sent" };
// } catch (error) {
//     console.error("Error sending verification email:", error);
//     return { error: "Failed to send verification email" };
// }

// };