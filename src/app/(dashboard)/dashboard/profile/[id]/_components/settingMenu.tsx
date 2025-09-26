"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  LucideSettings,
  LucideMessageSquare,
  LucideLogOut,
  LucidePenSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";

// Icon wrapper tokens to mirror your tab/edit style
const iconWrapperBase =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-primary-glow";
const iconWrapper7 = `${iconWrapperBase} w-7 h-7`;
const iconWrapper6 = `${iconWrapperBase} w-6 h-6`;

export const SettingsMenu = () => {
  const user = useCurrentUser();
  if (!user) {
    console.error("User ID is undefined");
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={[
            "group inline-flex items-center gap-2",
            "rounded-full border border-border/60 bg-muted/40 px-4 py-2",
            "text-xs uppercase tracking-wide",
            "text-muted-foreground/80",
            "transition-all duration-200",
            "hover:text-foreground hover:bg-background/60",
            "data-[state=active]:text-foreground",
            "data-[state=active]:bg-background",
            "shadow-none hover:shadow-primary-glow",
            "focus-visible:outline-none focus-visible:ring-0",
          ].join(" ")}
        >
          <span className={iconWrapper6}>
                <LucideSettings className="w-4 h-4" />
              </span>
          <span className="font-medium">Settings</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={[
          "w-56 rounded-xl border border-border/60",
          "bg-muted/40 backdrop-blur-sm",
          "p-2",
          "shadow-lg",
        ].join(" ")}
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground/80">
          Menu
        </DropdownMenuLabel>

        <Link href="/dashboard/settings/" passHref>
          <DropdownMenuItem
            asChild
            className={[
              "group cursor-pointer",
              "rounded-lg",
              "text-sm",
              "text-muted-foreground/90",
              "hover:text-foreground",
              "focus:text-foreground",
              "transition-colors",
            ].join(" ")}
          >
            <a className="flex w-full items-center gap-3 px-2 py-2">
              <span className={iconWrapper6}>
                <LucideSettings className="w-3.5 h-3.5" />
              </span>
              <span className="font-medium">Settings</span>
            </a>
          </DropdownMenuItem>
        </Link>

        <Link href="/dashboard/settings/chat" passHref>
          <DropdownMenuItem
            asChild
            className={[
              "group cursor-pointer",
              "rounded-lg",
              "text-sm",
              "text-muted-foreground/90",
              "hover:text-foreground",
              "focus:text-foreground",
              "transition-colors",
            ].join(" ")}
          >
            <a className="flex w-full items-center gap-3 px-2 py-2">
              <span className={iconWrapper6}>
                <LucideMessageSquare className="w-3.5 h-3.5" />
              </span>
              <span className="font-medium">Chat settings</span>
            </a>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          className={[
            "group cursor-pointer",
            "rounded-lg",
            "text-sm",
            "text-muted-foreground/90",
            "hover:text-foreground",
            "focus:text-foreground",
            "transition-colors",
          ].join(" ")}
          onSelect={(e) => e.preventDefault()} // prevent closing if LogoutButton manages its own dialog
        >
          <div className="flex w-full items-center gap-3 px-2 py-2">
            <span className={iconWrapper6}>
              <LucideLogOut className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-2">
              <LogoutButton />
              <span className="font-medium">Logout</span>
            </div>
          </div>
        </DropdownMenuItem>

        {user.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <Link href="/create-blog" passHref>
              <DropdownMenuItem
                asChild
                className={[
                  "group cursor-pointer",
                  "rounded-lg",
                  "text-sm",
                  "text-muted-foreground/90",
                  "hover:text-foreground",
                  "focus:text-foreground",
                  "transition-colors",
                ].join(" ")}
              >
                <a className="flex w-full items-center gap-3 px-2 py-2">
                  <span className={iconWrapper6}>
                    <LucidePenSquare className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium">Create Blog</span>
                </a>
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};