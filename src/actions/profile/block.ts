"use server";
import { blockUser, unblockUser } from "@/lib/block-service"
import { revalidatePath } from "next/cache";

export const onBlock = async (id: string) => {
    try {
        const blockedUser = await blockUser(id);
        revalidatePath("/")
     if(blockedUser) {
        revalidatePath(`/profile/${blockedUser.blocked.id}`)
     }
      return blockedUser;
    
    } catch (error) {
        throw new Error("Internal Server Error") 
    }
}


export const onUnBlock = async (id: string) => {
    try {
    const unblockedUser = await unblockUser(id);
  revalidatePath("/")
  if(unblockedUser) {
     revalidatePath(`/profile/${unblockedUser.blocked.id}`)
  }
   return unblockedUser;
} catch (error) {
    throw new Error("Internal Server Error") 
}
 }