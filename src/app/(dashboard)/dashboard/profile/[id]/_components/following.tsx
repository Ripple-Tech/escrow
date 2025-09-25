"use client"

import UserCard from "@/components/card/UserCard";
import { Follow, User } from "@prisma/client"

interface FollowingProps {
    data: (Follow & {following: User})[];
}
export const Following = ({data}: FollowingProps) => {
    if (!data.length){return null;}

    return (
        <div className="pl-6 mb-4">
          <ul className="flex flex-col pt-3 flex-1 gap-7 w-full">
                 {data.length  > 0 ? (
                   data.map((follow) => (
                    <li key={follow.following.id}>
              <UserCard
                key={follow.following.id}
                user={{
                  id: follow.following.id,
                  name: follow.following.name,
                  username: follow.following.username,
                  image: follow.following.image,
                }}
              />
            </li>

                   ))
                 ) : (
                   <p>You are not following anyone</p>
                 )}
               </ul>

        </div>
    )
}