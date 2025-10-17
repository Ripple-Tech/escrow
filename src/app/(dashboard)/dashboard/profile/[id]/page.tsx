// app/(dashboard)/dashboard/profile/[id]/page.tsx
import Image from "next/image";
import currentUser from "@/actions/getCurrentUser";
import Link from "next/link";
import ProfileHeaderClient from "@/app/(dashboard)/dashboard/profile/[id]/_components/profile-header-client"; 
import { fetchUser } from "@/actions/user.actions";
import { buildInviteLink } from "@/lib/invitation-link";

const profileTabs = [
  { value: "threads", label: "Posts", icon: "/reply.svg" },
  { value: "replies", label: "Replies", icon: "/members.svg" },
  { value: "tagged", label: "Tagged", icon: "/tag.svg" },
];

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(params.id);
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
        imgUrl={user.imgUrl|| null}
        shareUrl={shareUrl}
        status={"verified"}
        paystackDemo
        bankName="Wema Bank"
        verifiedUser={user.emailVerified || null}
      />

    
    </section>
  );
}