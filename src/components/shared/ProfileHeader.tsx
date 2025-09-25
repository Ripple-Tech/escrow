import Link from "next/link";
import Image from "next/image";
import { Actions } from "@/app/(dashboard)/dashboard/profile/[id]/_components/actions";
import { isFollowingUser } from "@/lib/follow-service";
import { UserCircle } from "lucide-react";

interface Props {
  accountId: string;
  authUserId: string;
  name: string | null;
  username: string | null;
  imgUrl: string | null;
}

// Icon wrapper tokens to mirror your tab style
const iconWrapperBase =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-primary-glow";
const iconWrapper7 = `${iconWrapperBase} w-7 h-7`;
const iconWrapper9 = `${iconWrapperBase} w-9 h-9`;

async function ProfileHeader({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
}: Props) {
  const isFollowing = await isFollowingUser(accountId);

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Name */}
        <div className="flex items-center p-3 gap-4">
          {/* Avatar with rounded ring + subtle glow */}
          <div className="relative h-20 w-20 rounded-full border border-border/60 bg-muted/40 shadow-primary-glow overflow-hidden">
            {imgUrl ? (
              <Image
                src={imgUrl}
                alt="user avatar"
                fill
                className="object-cover"
                sizes="80px"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-background">
                <UserCircle className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-left text-2xl font-semibold text-foreground">
              {name}
            </h2>
            <p className="text-sm uppercase tracking-wide text-muted-foreground/80">
              @{username}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        {accountId === authUserId ? (
          <Link href="/profile/edit" className="shrink-0">
            <div
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
              <span className={iconWrapper7}>
                <Image
                  src="/edit.svg"
                  alt="Edit"
                  width={14}
                  height={14}
                  className="object-contain"
                />
              </span>
              <span className="font-medium">Edit</span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            {/* You can wrap Actions or its internal buttons with the same pills style if needed */}
            <Actions userId={accountId} isFollowing={isFollowing} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;