"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-white transition hover:text-zinc-200"
        >
          <Zap className="size-5 shrink-0 text-cyan-400" aria-hidden strokeWidth={2.5} />
          <span className="text-sm sm:text-base">Archivolt</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm", variant: "ghost" }),
                "text-zinc-400 hover:bg-zinc-800 hover:text-white",
              )}
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8 ring-2 ring-cyan-500/30",
                },
              }}
            />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-lg bg-cyan-500 font-semibold text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-400",
                )}
              >
                Get started
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </header>
  );
}
