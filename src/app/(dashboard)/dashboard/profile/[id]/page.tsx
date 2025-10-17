// app/(dashboard)/dashboard/profile/[id]/page.tsx
import Image from "next/image";
import currentUser from "@/actions/getCurrentUser";
import Link from "next/link";
import ProfileHeaderClient from "@/app/(dashboard)/dashboard/profile/[id]/_components/profile-header-client"; // ✅ direct import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUser } from "@/actions/user.actions";
import { Block } from "./_components/actions";
import { isBlockedByUser } from "@/lib/block-service";
import { SettingsMenu } from "./_components/settingMenu";
import InviteSharableLink from "./_components/invitation-link";
import { buildInviteLink } from "@/lib/invitation-link";
import { isFollowingUser } from "@/lib/follow-service";

const profileTabs = [
  { value: "threads", label: "Posts", icon: "/reply.svg" },
  { value: "replies", label: "Replies", icon: "/members.svg" },
  { value: "tagged", label: "Tagged", icon: "/tag.svg" },
];

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(params.id);
  const isBlocked = await isBlockedByUser(userInfo.id);
  const isFollowing = await isFollowingUser(userInfo.id);
  const shareUrl = buildInviteLink(userInfo.username) ?? null;

  return (
    <section>
      {/* ✅ Client-side header directly */}
      <ProfileHeaderClient
        accountId={user.id}
        email={user.email || null}
        role={user.role || null}
        phonenumber={user.phonenumber || null}
        isTwoFactorEnabled={user.isTwoFactorEnabled || null}
        createdAt={user.createdAt || null}
        name={user.name || null}
        username={user.username}
        imgUrl={user.image || null}
        shareUrl={shareUrl}
        status={"verified"}
        paystackDemo
        bankName="VFD Microfinance Bank"
        verifiedUser={user.emailVerified || null}
      />

    
    </section>
  );
}