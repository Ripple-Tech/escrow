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
  if (!userId) return null;
try {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      invitedUsers: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
} catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
}

}

