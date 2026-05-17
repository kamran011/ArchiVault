"use client";

import { AuthNav } from "@/components/shared/AuthNav";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { siteContainerClass, siteGutterClass } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-black/50 backdrop-blur-md">
      <div className={siteGutterClass}>
        <div
          className={cn(
            siteContainerClass,
            "flex h-14 items-center justify-between gap-4 sm:h-16",
          )}
        >
          <BrandWordmark textClassName="text-sm sm:text-base" logoSize={24} />

          <div className="flex items-center gap-2 sm:gap-3">
            <AuthNav variant="header" />
          </div>
        </div>
      </div>
    </header>
  );
}
