"use server"
import { db } from "@/db";

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