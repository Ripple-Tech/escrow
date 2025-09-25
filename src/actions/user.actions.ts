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