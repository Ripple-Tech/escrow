"use server";
import { db } from '@/db'
import currentUser  from "@/actions/getCurrentUser";


export const isBlockedByUser = async (id: string): Promise<boolean> => {
    try {
        const user = await currentUser();
        if (!user) return false;
        const otherUser = await db.user.findUnique({
            where: { id },
        });
      if (!otherUser){
        throw new Error ("User not found");
      }
      if (otherUser.id === user.id) {
        return false;
      }

     const existingBlock = await db.block.findUnique({
        where: {
            blockerId_blockedId: {
              blockerId:    otherUser.id,
              blockedId:    user.id,
            }
        }
     }) 
     return !!existingBlock;
    } catch (error) {
        return false;
    }
}
 
export const blockUser = async (id: string) => {
    const user = await currentUser();
     if (!user) return false;
     if(user.id === id) {throw new Error ("Cannot block yourself");}

     const otherUser = await db.user.findUnique({
        where: { id },
    });
  if (!otherUser){
    throw new Error ("User not found");
  }

  const existingBlock = await db.block.findUnique({
    where: {
        blockerId_blockedId: {
            blockerId:    user.id,
            blockedId:    otherUser.id,
          }
    }
  });
  if(existingBlock) {
    throw new Error ("Already blocked");
  }

  const block = await db.block.create({
    data: {
        blockerId: user.id,
        blockedId: otherUser.id,
    },
    include: {
        blocked: true
    }
  })
   return block;
}

export const unblockUser =  async (id: string) => {
    const user = await currentUser();
     if (!user) return false;
     if(user.id === id) {throw new Error ("Cannot unblock yourself");}

     const otherUser = await db.user.findUnique({
        where: { id },
       });
     if (!otherUser){
       throw new Error ("User not found");
     }

     const existingBlock = await db.block.findUnique({
        where: {
            blockerId_blockedId : {
                blockerId: user.id,
                blockedId: otherUser.id,
            }
        }
     });
     if(!existingBlock) {
        throw new Error ("Not blocked");
     }

     const unblock = await db.block.delete({
        where: {
            id: existingBlock.id
        },
        include: {
            blocked: true
        }
     });
     return unblock;
}