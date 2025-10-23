"use server"
import { auth } from "@/auth";
import { db } from "@/db";
import { listBanksNGN, resolveAccount } from "@/lib/paystack";
import bcrypt from "bcryptjs";

export async function fetchUser(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        following: true,
        followedBy: true,
      },
    });

    if (!user) {
      throw new Error(`User with username ${userId} not found`);
    }

    return user;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}



export async function getInvitedUsers(userId: string) {
  if (!userId) return [];

  try {
    const invited = await db.user.findMany({
      where: {
        invitedById: userId,
        emailVerified: { not: null }, // ✅ only include verified users
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    console.log("invitedUsers", invited);
    return invited;
  } catch (error: any) {
    throw new Error(`Failed to fetch invited users: ${error.message}`);
  }
}

// Update user's image URL
export async function updateUserImage(userId: string, imageUrl: string | null) {
  if (!userId) throw new Error("Missing userId");

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: { image: imageUrl }, // null to clear
      select: {
        id: true,
        image: true,
        name: true,
        username: true,
        email: true,
      },
    });

    return updated;
  } catch (error: any) {
    throw new Error(`Failed to update user image: ${error.message}`);
  }
}

// Hard-delete a user
export async function deleteUser(userId: string) {
  if (!userId) throw new Error("Missing userId");

  try {
    // If you have relations with onDelete: Cascade in Prisma, this is enough.
    // Otherwise, delete dependent records first to avoid FK violations.
    await db.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}







export async function upsertUserBvn(bvn: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  if (!bvn) throw new Error("BVN required");
  const bvnhash = await bcrypt.hash(bvn, 12);
  await db.user.update({ where: { id: userId }, data: { bvnhash } });
  return { success: true };
}

export async function listBanks() {
  const banks = await listBanksNGN();
  return banks;
}

export async function verifyAndCreatePaymentMethod(input: {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  setDefault?: boolean;
  bvn?: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // First, check if the user already has this account number in their payment methods
  const existingPaymentMethod = await db.paymentMethod.findFirst({
    where: {
      userId: userId,
      accountNumber: input.accountNumber,
    },
  });

  if (existingPaymentMethod) {
    throw new Error(
      `This account number (${input.accountNumber}) has already been added to your payment methods.`
    );
  }

  // Resolve account first to get account details
  const resolved = await resolveAccount(input.bankCode, input.accountNumber);

  // Now handle BVN verification with the resolved account details
  const user = await db.user.findUnique({ 
    where: { id: userId }, 
    select: {  name: true, surname: true } 
  });


  // Name verification: Check if resolved account name matches user's registered name
  if (resolved.accountName && user) {
    const nameMatch = compareNames(
      { firstName: user.name, lastName: user.surname },
      resolved.accountName
    );
    
    if (!nameMatch.matches) {
      const displayName =
    [user.name, user.surname].filter(Boolean).join(" ").trim() || "Not provided";

      throw new Error(
        `Account name verification failed. ` +
        `Bank account is registered to: "${resolved.accountName}". ` +
        `Your profile name is: "${displayName}". ` +
        `Please use an account registered in your name or update your profile information.`
      );
    }
  }

  // Create the payment method
  const pm = await db.paymentMethod.create({
    data: {
      userId,
      currency: "NGN",
      country: "NG",
      bankName: input.bankName,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      accountName: resolved.accountName,
      status: "VERIFIED",
      verifiedAt: new Date(),
      verificationRef: `ps_resolve_${Date.now()}`,
      verificationMeta: { source: "paystack", resolved },
      isDefault: Boolean(input.setDefault),
    },
  });

  if (input.setDefault) {
    await db.paymentMethod.updateMany({
      where: { userId, id: { not: pm.id } },
      data: { isDefault: false },
    });
  }

  return pm;
}

// Improved name comparison function
function compareNames(
  userNames: { firstName?: string | null; lastName?: string | null },
  bankAccountName: string
): { matches: boolean; confidence: number } {
  if (!userNames.firstName && !userNames.lastName) {
    return { matches: true, confidence: 0 }; // No user names to compare with
  }

  if (!bankAccountName) {
    return { matches: true, confidence: 0 }; // No bank account name to compare
  }

  // Normalize names for comparison
  const userFirstName = (userNames.firstName || '').toLowerCase().trim();
  const userLastName = (userNames.lastName || '').toLowerCase().trim();
  const bankName = bankAccountName.toLowerCase().trim();

  // If user has both names, check different combinations
  if (userFirstName && userLastName) {
    const fullName = `${userFirstName} ${userLastName}`;
    const reverseFullName = `${userLastName} ${userFirstName}`;
    
    // Direct matches
    if (bankName === fullName || bankName === reverseFullName) {
      return { matches: true, confidence: 1.0 };
    }

    // Check if both first and last names are present in bank name (in any order)
    const hasFirstName = bankName.includes(userFirstName);
    const hasLastName = bankName.includes(userLastName);
    
    if (hasFirstName && hasLastName) {
      return { matches: true, confidence: 0.9 };
    }

    // Check initials or partial matches
    if (hasFirstName && userLastName.length > 0 && bankName.includes(userLastName.charAt(0))) {
      return { matches: true, confidence: 0.8 };
    }

    if (hasLastName && userFirstName.length > 0 && bankName.includes(userFirstName.charAt(0))) {
      return { matches: true, confidence: 0.8 };
    }
  }

  // If only first name is available
  //if (userFirstName && !userLastName) {
   // if (bankName.includes(userFirstName)) {
  //    return { matches: true, confidence: 0.7 };
  //  }
 // }

  // If only last name is available
  if (userLastName && !userFirstName) {
    if (bankName.includes(userLastName)) {
      return { matches: true, confidence: 0.7 };
    }
  }

  return { matches: false, confidence: 0 };
}


export async function getUserPaymentMethods() {
  try {
    const session = await auth();
    //console.log("Full session:", session);
    
    const userId = session?.user?.id;
    //console.log("User ID from session:", userId);
    
    if (!userId) {
     // console.log("No user ID found in session");
      throw new Error("Unauthorized");
    }

    // Test if user exists
    const userExists = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
   //console.log("User exists:", userExists);

    const paymentMethods = await db.paymentMethod.findMany({
      where: {
        userId: userId,
      },
    });
    
   // console.log("Payment methods found:", paymentMethods);
    return paymentMethods;
  } catch (error: any) {
   // console.error("Complete error details:", {
     // name: error.name,
     // message: error.message,
    //  stack: error.stack
    //});
    throw new Error("Failed to load payment methods: " + error.message);
  }
}