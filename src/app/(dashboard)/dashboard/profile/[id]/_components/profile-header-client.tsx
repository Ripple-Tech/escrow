"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { BadgeCheck, Copy, UserCircle, SquarePenIcon, Camera } from "lucide-react";
import { cn } from "@/utils";

import InviteSharableLink from "./invitation-link";
import { buildInviteLink } from "@/lib/invitation-link";

// Tabs from your UI lib
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { DetailsPanel } from "./DetailsPanel";
import { EditPanel } from "./Edit-Panel";

export interface ProfileHeaderClientProps {
  accountId: string;
  name: string | null;
  email: string | null;
  username: string | null;
  imgUrl: string | null;
  shareUrl?: string | null;
  phonenumber?: string | null;
  role?: string | null;
  isTwoFactorEnabled?: boolean | null;
  verifiedUser?: Date | string | null;
  status: "verified" ;
  bankName?: string | null;
  paystackDemo?: boolean;
  variant?: "default" | "avatar-only";
  createdAt?: string | Date | null;
  inviteCode?: string | null;
  handleImageChange?: (file: File) => Promise<void> | void;
}

const surfaceCard =
  "rounded-2xl border border-amber-600/20 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-sm";
const chipBase =
  "inline-flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-amber-700 text-white";
const labelMuted = "text-[10px] uppercase tracking-wide text-foreground/60";

// Deterministic demo 10-digit number
function seededDemoNumber(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const num = (h % 9_000_000_000) + 1_000_000_000;
  return String(num);
}

function formatJoined(createdAt?: string | Date | null) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return `Joined ${d.toLocaleString(undefined, { month: "long", year: "numeric" })}`;
}

export default function ProfileHeaderClient({
  accountId,
  email,
  phonenumber,
  role,
  isTwoFactorEnabled,
  name,
  username,
  verifiedUser,
  imgUrl,
  status = "verified",
  bankName = "Wema Bank",
  paystackDemo = true,
  variant = "default",
  createdAt,
  handleImageChange,
}: ProfileHeaderClientProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Prefer computed shareUrl from username
  const shareUrl = buildInviteLink(username) ?? null;

  const demoAccountNumber = useMemo(
    () => (paystackDemo ? seededDemoNumber(accountId) : ""),
    [paystackDemo, accountId]
  );

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  }, []);

  const joinedText = formatJoined(createdAt);

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

  if (variant === "avatar-only") {
    return (
      <div className="relative h-9 w-9 rounded-full border border-amber-600/30 bg-amber-600/10 overflow-hidden">
        {imgUrl ? (
          <Image src={imgUrl} alt="user avatar" fill className="object-cover" sizes="36px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserCircle className="h-5 w-5 text-amber-700/70" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Avatar and identity */}
      <div className="flex flex-col items-center pt-3">
        {/* Avatar container with camera icon positioned at top edge */}
        <div className="relative">
          {/* Avatar */}
          <div className="relative h-16 w-16 rounded-full overflow-hidden border border-amber-600/30 bg-amber-600/10">
            {imgUrl ? (
              <Image src={imgUrl} alt="user avatar" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserCircle className="h-8 w-8 text-amber-700/70" />
              </div>
            )}
            
            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>

          {/* Camera icon positioned at top-right edge */}
          {handleImageChange && (
            <>
              <button
                type="button"
                onClick={onPick}
                className={cn(
                  "absolute -top-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full",
                  "border border-amber-600/20 bg-white text-amber-700 shadow-lg",
                  "transition-all duration-200 ease-in-out",
                  "hover:bg-amber-50 hover:scale-110",
                  "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
                  "active:scale-95",
                  uploading && "opacity-50 cursor-not-allowed"
                )}
                aria-label={uploading ? "Uploading profile photo..." : "Change profile photo"}
                disabled={uploading}
                title={uploading ? "Uploading..." : "Change profile photo"}
              >
                {uploading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {/* Status */}
        <div className="mt-2 flex items-center gap-2">
          {status === "verified" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px]">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        <div className="mt-1 text-center">
          <h2 className="text-sm font-semibold text-foreground">{name ?? "User"}</h2>
          {username && <p className="text-[11px] text-foreground/70">@{username}</p>}
          {joinedText && <p className="text-[10px] text-foreground/60 mt-0.5">{joinedText}</p>}
          {uploading && <p className="mt-1 text-[10px] text-foreground/60">Uploading...</p>}
        </div>
      </div>

      {/* Invitation Link + Account Number (paired, compact) */}
      <section className="mt-4 px-3">
        <div className={cn(surfaceCard, "p-2")}>
          <div className="grid grid-cols-2 gap-2">
            {/* Invitation Link */}
            <div className="rounded-lg border border-amber-600/20 bg-amber-600/5 px-2.5 py-1.5">
              <span className="block text-[9px] uppercase tracking-wide text-foreground/60 leading-none">
                Invitation Link
              </span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-[12px] truncate">
                  {shareUrl ? shareUrl : "—"}
                </span>
                {shareUrl && (
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                    onClick={() => handleCopy(shareUrl, "inv")}
                    aria-label="Copy invitation link"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Account Number */}
            <div className="rounded-lg border border-amber-600/20 bg-amber-600/5 px-2.5 py-1.5">
              <span className="block text-[9px] uppercase tracking-wide text-foreground/60 leading-none">
                {bankName}
              </span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-[12px]">
                  {paystackDemo ? demoAccountNumber : "••••••••••"}
                </span>
                {paystackDemo && (
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                    onClick={() => handleCopy(demoAccountNumber, "acct")}
                    aria-label="Copy account number"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>    
            </div>
          </div>
        </div>
      </section>

      {/* Tabs with amber brand colors */}
      <section className="mt-4 px-3">
        <Tabs defaultValue="security" className="w-full">
          <TabsList
            className={cn(
              "grid w-full grid-cols-3 rounded-xl p-1",
              // Subtle background that works on light/dark
              "bg-amber-600/10 dark:bg-amber-600/10"
            )}
          >
            <TabsTrigger
              value="security"
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                "text-amber-900/80 dark:text-amber-100/80",
                "data-[state=active]:bg-amber-600 data-[state=active]:text-white",
                "hover:bg-amber-600/20"
              )}
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                "text-amber-900/80 dark:text-amber-100/80",
                "data-[state=active]:bg-amber-600 data-[state=active]:text-white",
                "hover:bg-amber-600/20"
              )}
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                "text-amber-900/80 dark:text-amber-100/80",
                "data-[state=active]:bg-amber-600 data-[state=active]:text-white",
                "hover:bg-amber-600/20"
              )}
            >
              Edit Profile
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <TabsContent value="activity" className="space-y-4">
              <div className="rounded-2xl border border-amber-600/20 p-4">
                <h3 className="text-xl md:text-2xl text-center font-semibold mb-2">
                  Your Wellness & Activities
                </h3>
                <p className="text-sm text-center text-foreground/70 mb-4">
                  Track all progress in Almazin activities that you have joined or already participated in.
                </p>
                {/* Replace with your component if available */}
                {/* <ProgressCards activities={userProgress.activities} /> */}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="rounded-2xl border border-amber-600/20 p-4">
                <DetailsPanel
                  data={{
                    name: name,
                    email: email,
                    phonenumber: phonenumber,
                    role: role,
                    isTwoFactorEnabled: isTwoFactorEnabled,
                    createdAt: createdAt,
                    verifiedUser: verifiedUser,
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="edit">
              <EditPanel /> 
              <div className="rounded-2xl border border-amber-600/20 p-4">
                <p className="text-sm text-foreground/80">Edit content goes here.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </div>
  );
}