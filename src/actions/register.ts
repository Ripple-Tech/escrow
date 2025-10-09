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
  // don’t validate referralUsername with zod to avoid breaking existing schema
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, surname, username, phonenumber, password, name } = validatedFields.data;
  const referralUsername = values.referralUsername?.trim().toLowerCase();

  const hashedPassword = await bcrypt.hash(password, 10);
  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "Email already in use!" };
  }

  if (normalizedUsername) {
    const existingByUsername = await getUserByUsername(normalizedUsername);
    if (existingByUsername) {
      return { error: "Username already taken!" };
    }
  }

  // Optional: resolve inviter if referralUsername provided
  let inviterId: string | undefined = undefined;
  if (referralUsername && referralUsername !== normalizedUsername) {
    const inviter = await getUserByUsername(referralUsername);
    if (inviter?.id) {
      inviterId = inviter.id;
    }
  }

  try {
    await db.user.create({
      data: {
        name,
        email,
        surname,
        phonenumber,
        username: normalizedUsername,
        password: hashedPassword,
        ...(inviterId ? { invitedById: inviterId } : {}), // optional, safe
      },
    });
  } catch (e: any) {
    // Handle race-condition duplicate (Prisma unique constraint)
    if (e?.code === "P2002" && Array.isArray(e?.meta?.target)) {
      if (e.meta.target.includes("username")) {
        return { error: "Username already taken!" };
      }
      if (e.meta.target.includes("email")) {
        return { error: "Email already in use!" };
      }
    }
    return { error: "Failed to create user" };
  }

  // Generate email verification token
  const verificationToken = await generateVerificationToken(email);

  // Send verification email
  try {
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "Verification email sent" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { error: "Failed to send verification email" };
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