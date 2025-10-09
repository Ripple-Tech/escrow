"use client";

import { useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { Link2 } from "lucide-react";

type Props = {
  shareUrl?: string | null;
  labelTextClassName?: string;
  iconWrapperClassName?: string;
};

export default function InviteSharableLink({
  shareUrl,
  labelTextClassName = "block text-xs uppercase tracking-wide text-muted-foreground mb-1",
  iconWrapperClassName = "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-primary-glow w-7 h-7",
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Failed to copy link.");
    }
  };

  if (!shareUrl) return null;

  return (
    <div className="mt-6 px-5">
      <div className="flex items-start gap-3 flex-wrap">
        <span className={iconWrapperClassName}>
          <Link2 className="w-4 h-4" />
        </span>

        <div className="flex-1 min-w-0">
          <span className={labelTextClassName}>Invitation Link</span>

          <div className="flex items-center gap-2 min-w-0">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline text-sm truncate max-w-[60%]"
            >
              {shareUrl}
            </a>

            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-primary-glow"
              onClick={() => handleCopy(shareUrl)}
            >
              <IoCopyOutline size={16} />
              {copied ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <span>Copy</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}