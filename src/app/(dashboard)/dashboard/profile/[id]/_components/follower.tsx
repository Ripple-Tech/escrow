"use client";

import UserCard from "@/components/card/UserCard";
import { Follow, User } from "@prisma/client";

interface FollowersProps {
  data: (Follow & { follower: User })[];
}

export const Followers = ({ data }: FollowersProps) => {
  if (!data.length) {
    return null;
  }

  return (
    <div className="pl-6 mb-4">
      <ul className="flex flex-col pt-3 flex-1 gap-7 w-full">
        {data.map((follow) => (
          <li key={follow.follower.id}>
            <UserCard
              key={follow.follower.id}
              user={{
                id: follow.follower.id,
                name: follow.follower.name,
                username: follow.follower.username,
                image: follow.follower.image,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
