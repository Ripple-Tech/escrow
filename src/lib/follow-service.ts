"use server"
import { db } from '@/db'
import  currentUser  from "@/actions/getCurrentUser";
import { Follow, User } from '@prisma/client';

export const getFollowing = async (userId: string): Promise<(Follow & { following: User })[]> => {
  try {
    const followedUsers = await db.follow.findMany({
      where: {
        followerId: userId,
        following: {
          NOT: {
            OR: [
              {
                blocking: {
                  some: {
                    blockedId: userId,
                  },
                },
              },
              {
                blockedBy: {
                  some: {
                    blockerId: userId,
                  },
                },
              },
            ],
          },
        },
      },
      include: {
        following: true,
      },
    });

    return followedUsers;
  } catch (error) {
    console.error("Failed to fetch followed users:", error);
    return [];
  }
};


{/*
following: {
  NOT: [ {
  blocking: {
    none: {
      blockedId: userId
    }
  }
  },
 {
  blockedBy: {
    some: {
      blockerId: userId
    }
  }
 }
]
}, */}

export const getFollowers = async (userId: string): Promise<(Follow & { follower: User })[]> => {
  try {
    const followers = await db.follow.findMany({
      where: {
        followingId: userId,
        follower: {
          NOT: {
            OR: [
              {
                blocking: {
                  some: {
                    blockedId: userId,
                  },
                },
              },
              {
                blockedBy: {
                  some: {
                    blockerId: userId,
                  },
                },
              },
            ],
          },
        },
      },
      include: {
        follower: true,
      },
    });

    return followers;
  } catch (error) {
    console.error("Failed to fetch followers:", error);
    return [];
  }
};



// get Verified Followers
export const getVerifiedFollowers = async (userId: string): Promise<(Follow & { follower: User })[]> => {
  try {
    const verifiedFollowers = await db.follow.findMany({
      where: {
        followingId: userId,
        follower: {
          verifiedUser: {
            not: null
          },
        },
      },
      include: {
        follower: true,
      },
    });

    return verifiedFollowers;
  } catch (error) {
    console.error("Failed to fetch verified followers:", error);
    return [];
  }
};


export const isFollowingUser = async (id: string): Promise<boolean> => {
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
        return true;
      }

     const existingFollow = await db.follow.findFirst({
        where: {
            followerId: user.id,
            followingId: otherUser.id,
        }
     }) 
     return !!existingFollow

    } catch (error) {
        return false;
    }
}

export const followUser = async(id: string) => {
    const user = await currentUser();
    if (!user) return null;
    const otherUser = await db.user.findUnique({
      where: { id },
    });
    if (!otherUser) {throw new Error("User not found")}
    if (otherUser.id === user.id) {throw new Error("Cannot follow yourself")}

    const existingFollow = await db.follow.findFirst({
        where: {
            followerId : user.id,
            followingId: otherUser.id
        },
    });
    if (existingFollow) {throw new Error("Already following")} 

    const follow = await db.follow.create({
        data: {
            followerId: user.id,
            followingId: otherUser.id
        }, 
        include: {
          following: true,
          follower: true,
        },
    });
    return follow;
};

export const unFollowUser = async (id: string) => {
    const user = await currentUser();
    if (!user) return null;
    const otherUser = await db.user.findUnique({
      where: { id },
    });
    if (!otherUser) {throw new Error("User not found")}
    if (otherUser.id === user.id) {throw new Error("Cannot unfollow yourself")}

   const existingFollow = await db.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: otherUser.id
      }
   });
   if (!existingFollow) {throw new Error("Not following")}

   const follow = await db.follow.delete({
    where: {
        id: existingFollow.id,
    }, include: {
        following: true,
    },
   });
     return follow;
}
