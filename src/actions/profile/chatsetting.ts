"use server";

import { db } from "@/db";
import currentUser from "@/actions/getCurrentUser";

export const updateChatSettings = async (settings: {
  isChatEnabled?: boolean;
  isChatDelayed?: boolean;
  isChatFollowersOnly?: boolean;
}) => {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: settings,
    });
    return { success: "Chat settings updated successfully!" };
  } catch (error) {
    return { error: "Failed to update chat settings." };
  }
};