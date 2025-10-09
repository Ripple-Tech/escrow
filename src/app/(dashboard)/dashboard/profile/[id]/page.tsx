import Image from "next/image";
import currentUser from "@/actions/getCurrentUser";
import Link from "next/link";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUser } from "@/actions/user.actions";
import { Block } from "./_components/actions";
import { isBlockedByUser } from "@/lib/block-service";
import { SettingsMenu } from "./_components/settingMenu";
import InviteSharableLink from "./_components/invitation-link";
import { buildInviteLink } from "@/lib/invitation-link";

// Styled icon wrappers (matches your style snippet)
const iconWrapperBase =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-primary-glow";
const iconWrapper7 = `${iconWrapperBase} w-7 h-7`;
const iconWrapper9 = `${iconWrapperBase} w-9 h-9`;

const profileTabs = [
  { value: "threads", label: "Posts", icon: "/reply.svg" },
  { value: "replies", label: "Replies", icon: "/members.svg" },
  { value: "tagged", label: "Tagged", icon: "/tag.svg" },
];

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userId = user.id;
  if (!userId) {
    console.error("User ID is undefined");
    return null;
  }

  const userInfo = await fetchUser(params.id);
  const isBlocked = await isBlockedByUser(userInfo.id);

// Build share URL for invitation (server-side)
  const shareUrl = buildInviteLink(userInfo.username) ?? null;
  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={userId}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
      />

      {/* Follow counts + settings */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row space-x-6 mt-4 px-5">
          <Link
            className="hover:underline text-gray-1"
            href={`/verified-followers/${userInfo.id}`}
          >
            <span className="text-black dark:text-light-1">
              {userInfo.followedBy.length}
            </span>{" "}
            followe
            {(userInfo.followedBy.length ?? 0) > 1 ? "rs" : "r"}
          </Link>

          <Link
            className="hover:underline text-gray-1"
            href={`/verified-followers/${userInfo.id}`}
          >
            <span className="text-black dark:text-light-1">
              {userInfo.following.length}
            </span>{" "}
            followin
            {(userInfo.following.length ?? 0) > 1 ? "gs" : "g"}
          </Link>
        </div>

        {userInfo.id === userId ? (
          <SettingsMenu />
        ) : (
          <Block userId={userInfo.id} isBlocked={isBlocked} />
        )}
      </div>

      {/* Invitation link block (client component) - just before the tabs */}
      <InviteSharableLink
        shareUrl={shareUrl ?? undefined}
        labelTextClassName="block text-xs uppercase tracking-wide text-muted-foreground mb-1"
        iconWrapperClassName={iconWrapper7}
      />

      <div className="mt-6 h-0.5 w-full bg-dark-3" />

      {/* Tabs */}
      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="mb-4 w-full flex gap-2 rounded-full bg-muted/40 p-1 border border-border/60">
            {profileTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={[
                  "group relative flex-1",
                  "flex items-center justify-center gap-2",
                  "rounded-full px-3 py-2",
                  "text-xs uppercase tracking-wide",
                  "text-muted-foreground/80",
                  "transition-all duration-200",
                  "hover:text-foreground hover:bg-background/60",
                  "data-[state=active]:text-foreground",
                  "data-[state=active]:bg-background",
                  "data-[state=active]:shadow-primary-glow",
                  "focus-visible:outline-none focus-visible:ring-0",
                ].join(" ")}
              >
                {/* Icon circle (uses next/image since your icons are SVG files) */}
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary shadow-primary-glow">
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={14}
                    height={14}
                    className="object-contain"
                    priority={false}
                  />
                </span>

                {/* Do NOT hide the label on small screens */}
                <span className="font-medium">{tab.label}</span>

                {/* Optional count badge on threads */}
                {tab.value === "threads" && (
                  <span className="ml-1 rounded-sm bg-light-4 px-2 py-0.5 text-[10px] leading-none text-light-2">
                    0
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.value}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              {tab.value === "threads" && <p>0</p>}
              {tab.value === "replies" && <p>No replies yet</p>}
              {tab.value === "tagged" && <p>No tagged posts</p>}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default Page;