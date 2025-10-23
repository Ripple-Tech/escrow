"use client";

import Image from "next/image";

type AppBrandFooterProps = {
  logoSrc?: string;      // e.g., "/logo.svg"
  appName?: string;      // e.g., "kyve"
  version?: string;      // e.g., "2.5.61"
  className?: string;
};

export default function AppBrandFooter({
  logoSrc = "/logo.svg",
  appName = "kyve",
  version,
  className,
}: AppBrandFooterProps) {
  const year = new Date().getFullYear();

  return (
    <div className="mt-8 flex w-full items-center justify-center mb-10">
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className={`rounded-2xl  text-foreground px-6 py-8 text-center ${className ?? ""}`}>
          <div className="inline-flex items-center gap-2">
            <div className="relative h-6 w-6">
              <Image
                src={logoSrc}
                alt={`${appName} logo`}
                fill
                sizes="24px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[20px] font-semibold tracking-tight">
              {appName}
            </span>
          </div>

          {version ? (
            <p className="mt-3 text-[12px] text-muted-foreground">
              App version {version}
            </p>
          ) : null}

          <p className="mt-4 text-[12px] text-muted-foreground">
            © {year} {appName.charAt(0).toUpperCase() + appName.slice(1)} Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}