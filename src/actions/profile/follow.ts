"use server";
import { revalidatePath } from "next/cache";
import { followUser, unFollowUser } from "@/lib/follow-service";

export const onFollow = async (id: string) => {
    try {
        const followedUser = await followUser(id);
      revalidatePath("/");
      if(followedUser) {
        revalidatePath(`/profile/${followedUser.following.id}`)
      }
      return followedUser;
    } catch (error) {
        throw new Error("Internal Server Error")
    }
};

export const onUnFollow = async (id: string) => {
    try {
        const unfollowedUser = await unFollowUser(id);
      revalidatePath("/");
      if(unfollowedUser) {
        revalidatePath(`/profile/${unfollowedUser.following.id}`)
      }
      return unfollowedUser;
    } catch (error) {
        throw new Error("Internal Server Error")
    }
};
