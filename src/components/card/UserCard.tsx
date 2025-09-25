"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export type MinimalUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

interface Props {
  user: MinimalUser;
}

function UserCard({ user  }: Props) {
  const router = useRouter();

  return (
    <article className='user-card dark:hover:bg-dark-3 '>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image
            src={user.image ?? ""}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
          />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold dark:text-light-1 text-black'>{user.name}</h4>
          <p className='text-small-medium text-gray-1'>@{user.username}</p>
        </div>
      </div>

      <Button
        className='user-card_btn'
        onClick={() => {
           router.push(`/profile/${user.id}`);
        }}
      >
        View
      </Button>
    </article>
  );
}

export default UserCard;