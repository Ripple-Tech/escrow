"use client";

import { Button } from "@/components/ui/button";
import { onFollow, onUnFollow } from "@/actions/profile/follow";
import { useTransition } from "react";
import { onBlock, onUnBlock } from "@/actions/profile/block";

interface ActionsProps {
    isFollowing: boolean;
    userId: string;
}
interface BlockProps {
    isBlocked: boolean;
    userId: string;
}
 export const Block = ({ userId, isBlocked}: BlockProps) => {
    const [isLoading, loadTransition] = useTransition();
    const handleBlock = () => {
        loadTransition(() => {
            onBlock(userId)
        });
    }
    const handleUnBlock = () => {
        loadTransition(() => {
           onUnBlock(userId);
       });
       };
    return(
        <div>
        <Button size="sm" variant="destructive" disabled={isLoading} onClick={handleBlock}>
        {isBlocked? "UnBlock" : "Block"}</Button>
        </div>
    )
}

export const Actions = ({isFollowing, userId}: ActionsProps) => {
    const [isPending, startTransition] = useTransition();
    
    const handleFollow = () => {
     startTransition(() => {
        onFollow(userId);
    });
    };

    const handleUnFollow = () => {
     startTransition(() => {
        onUnFollow(userId);
    });
    };

    const onClick = () => {
        if(isFollowing){
            handleUnFollow();
        } else {
            handleFollow();
        }}

    return (
        <>
        <Button size="sm" disabled={isPending} onClick={onClick}>
           {isFollowing? "Unfollow" : "Follow"} </Button>
        
        </>
    )
}