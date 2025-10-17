"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { BadgeCheck, Copy, UserCircle, SquarePenIcon, Camera, User2 } from "lucide-react";
import { cn } from "@/utils";
import handleImageSaveToFireBase from "@/lib/upload"; // your existing uploader
import { updateUserImage } from "@/actions/user.actions";
import InviteSharableLink from "./invitation-link";
import { buildInviteLink } from "@/lib/invitation-link";

// Tabs from your UI lib
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DetailsPanel } from "./DetailsPanel";
import { EditPanel } from "./Edit-Panel";
import { useRouter } from "next/navigation";

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
  status: "verified";
  bankName?: string | null;
  paystackDemo?: boolean;
  variant?: "default" | "avatar-only";
  createdAt?: string | Date | null;
  inviteCode?: string | null;
  handleImageChange?: (file: File) => Promise<void> | void; // remains optional for external override
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
  createdAt,
  handleImageChange, // optional external override
}: ProfileHeaderClientProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [img, setImg] = useState<string | null>(imgUrl ?? null);
  const [isPending, startTransition] = useTransition();

  // Local default implementation (upload -> update DB -> refresh)
  const handleImageChangeLocal = async (file: File) => {
    if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");

    // 1) Upload to Firebase -> get public URL
    const url = await handleImageSaveToFireBase(file);

    // 2) Update DB
    await updateUserImage(accountId, url);

    // 3) Optimistic UI + refresh
    setImg(url);
    startTransition(() => router.refresh());
  };

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

  // Use external handleImageChange if provided; otherwise fall back to local
  const effectiveHandleImageChange = handleImageChange ?? handleImageChangeLocal;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await effectiveHandleImageChange(file);
    } finally {
      setUploading(false);
      // reset input so same file can be selected again if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Avatar and identity */}
      <div className="flex flex-col items-center pt-3">
        <div className="relative">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border border-amber-600/30 bg-amber-600/10">
            {img ? (
              <Image src={img} alt="user avatar" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserCircle className="h-8 w-8 text-amber-700/70" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onPick}
            className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-600/20 bg-white text-amber-700 shadow-md hover:bg-amber-50 disabled:opacity-50"
            aria-label="Change profile photo"
            disabled={uploading || isPending}
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
          <h2 className="text-base font-semibold text-foreground">{name ?? "User"}</h2>
           {username && (
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <User2 className="h-4 w-4 text-gray-500" />
          <p className="text-[14px] text-foreground/70">@{username}</p>
        </div>
      )}
          {joinedText && <span className="text-[12px] text-foreground/60 mt-0.5">
          <span className="inline-flex items-center gap-1 text-gray-600">
                <Image
                  src="/favicon.ico"
                  alt=""
                  width={14}
                  height={14}
                  className="opacity-60"
                />
                {joinedText} </span> 
          </span> }
        </div>
      </div>

      {/* Rest of your existing code stays the same */}
      <section className="mt-4 px-3">
        <div className={cn(surfaceCard, "p-2")}>
          <div className="grid grid-cols-2 gap-2">
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
                    className="inline-flex shrink-0 items-center gap-1 text-[10px] px-0.5 py-0.5 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                    onClick={() => handleCopy(shareUrl, "inv")}
                    aria-label="Copy invitation link"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === "inv" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>

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
                    className="inline-flex shrink-0 items-center gap-1 text-[10px] px-0.5 py-0.5 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                    onClick={() => handleCopy(demoAccountNumber, "acct")}
                    aria-label="Copy account number"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === "acct" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 px-3">
        <Tabs defaultValue="security" className="w-full">
          <TabsList
            className={cn(
              "grid w-full grid-cols-3 rounded-xl p-1",
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
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="rounded-2xl border border-amber-600/20 p-4">
                <DetailsPanel
                  data={{
                    name: name,
                    email: email,
                    username: username,
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