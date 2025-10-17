"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Camera,
  ShieldAlert,
  BadgeCheck,
  Clock3,
  User2,
} from "lucide-react";
import { cn } from "@/utils";

type Props = {
  name?: string | null;
  image?: string | null;
  email?: string | null;
  createdAt?: Date | string | null;
  status?: "verified" | "pending" | "unverified";
  handleImageChange?: (file: File) => Promise<void> | void;
};

const primary = "#324F3B";

export function ProfileHeader({
  name,
  image,
  email,
  createdAt,
  status = "pending",
  handleImageChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const initials =
    name?.trim()
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "U";

  const joinText =
    createdAt &&
    `Joined ${new Date(createdAt).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    })}`;

  const onPick = () => inputRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !handleImageChange) return;
    setUploading(true);
    try {
      await handleImageChange(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border/60",
        "bg-gradient-to-br from-[#324F3B] via-emerald-900/40 to-background",
        "p-4 sm:p-6 text-foreground"
      )}
      style={{
        boxShadow:
          "0 10px 30px -12px rgba(50,79,59,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar + upload */}
        <div className="relative">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-white/10">
            <AvatarImage src={image || ""} alt={name || "User"} />
            <AvatarFallback className="bg-muted text-lg text-gray-700 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {handleImageChange && (
            <>
              <button
                type="button"
                onClick={onPick}
                className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/90 text-[--primary] shadow-md hover:bg-white"
                aria-label="Change profile photo"
                style={{ color: primary, ["--primary" as any]: primary }}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
              />
            </>
          )}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          {/* Name and Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 truncate">
              {name || "User"}
            </h2>
            {status === "verified" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-xs">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : status === "pending" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-400 px-2.5 py-0.5 text-xs">
                <Clock3 className="h-3.5 w-3.5" />
                Pending
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-400 px-2.5 py-0.5 text-xs">
                <ShieldAlert className="h-3.5 w-3.5" />
                Unverified
              </span>
            )}
          </div>

          {/* Email + join date */}
          <div className="mt-1 flex items-center gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
            {email && (
              <span className="inline-flex items-center font-medium gap-1 rounded-full bg-[#EBE3D0] text-gray-600 px-2.5 py-0.5 text-xs">
                <User2 className="h-3 w-3" />
                <span className="truncate">@{email.split("@")[0]}</span>
              </span>
            )}
            {joinText && (
              <span className="inline-flex items-center gap-1 text-gray-200">
                <Image
                  src="/favicon.ico"
                  alt=""
                  width={12}
                  height={12}
                  className="opacity-60"
                />
                {joinText}
              </span>
            )}
          </div>

          {/* Extra actions */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="rounded-full border-white/20">
              Two-Factor Auth
            </Button>
          </div>
        </div>

        {uploading && (
          <span className="text-xs text-muted-foreground">Uploading...</span>
        )}
      </div>
    </div>
  );
}