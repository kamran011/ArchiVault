"use client";

import { AuthNav } from "@/components/shared/AuthNav";
import { BrandWordmark } from "@/components/brand/BrandWordmark";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <BrandWordmark textClassName="text-sm sm:text-base" logoSize={24} />

        <div className="flex items-center gap-2 sm:gap-3">
          <AuthNav variant="header" />
        </div>
      </div>
    </header>
  );
}
