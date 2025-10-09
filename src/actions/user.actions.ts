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