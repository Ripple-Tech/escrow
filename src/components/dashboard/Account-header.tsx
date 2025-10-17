"use client";

import Image from "next/image";
import { Bell, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { CreateEscrowModal } from "../create-escrow";
import { Button } from "../ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Separator } from "@/components/ui/separator";


function getGreeting(date = new Date()) {
  // Simple ranges: morning [5–12), afternoon [12–17), evening [17–22), night otherwise
  const hour = Number(format(date, "H"));
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 16) return "Good afternoon";
  if (hour >= 16 && hour < 22) return "Good evening";
  return "Hello";
}

export default function AccountHeader() {
  const greeting = getGreeting();
  const user = useCurrentUser();
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 py-2">
        {/* Left: Avatar + Greeting */}
        <div className="flex items-center  gap-3">
          {/* Reduced avatar size */}
          <div className="relative h-12 w-12 rounded-full border border-border/60 bg-muted/40 shadow-primary-glow overflow-hidden">
            {user?.imgUrl ? (
              <Image
                src={user.imgUrl}
                alt="user avatar"
                fill
                className="object-cover"
                sizes="48px"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-background">
                <UserCircle className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-left text-lg md:text-xl font-semibold text-gray-900 leading-tight">
              {greeting}
            </h2>
            {user?.username ? (
              <p className="text-sm md:text-lg tracking-wide text-muted-foreground truncate">
                @{user.username}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: Bell + Create button */}
        <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex items-center justify-center rounded-full p-2 text-amber-600 hover:bg-muted/50 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>

         <CreateEscrowModal>
                        <Button
                          size="sm"
                          className="hidden md:block bg-primary text-primary-foreground hover:bg-amber-600/90 shadow-primary-glow"
                        >
                          + Create Escrow
                        </Button>
                      </CreateEscrowModal>
          </div>            

      </div>
       {/* Bottom separator with amber fade both ends */}
      <Separator
        decorative
        className="h-[1.5px] w-full border-0 bg-[linear-gradient(to_right,transparent,rgba(245,158,11,0.2),rgba(245,158,11,0.55),rgba(245,158,11,0.2),transparent)]"
      />
    </div>
  );
}