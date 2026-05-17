"use client"

import Link from "next/link"
import { useAuth, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthNavProps = {
  variant?: "landing" | "header"
}

function AuthNavPlaceholder({ variant }: { variant: "landing" | "header" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center",
        variant === "landing" ? "gap-3" : "gap-2 sm:gap-3",
      )}
    >
      <div className="h-8 w-16 rounded-lg bg-card" />
      <div className="h-8 w-24 rounded-lg bg-card" />
    </div>
  )
}

export function AuthNav({ variant = "landing" }: AuthNavProps) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <AuthNavPlaceholder variant={variant} />
  }

  if (isSignedIn) {
    return (
      <div className={cn("flex items-center", variant === "landing" ? "gap-3" : "gap-2 sm:gap-3")}>
        <Link
          href="/dashboard"
          className={
            variant === "landing"
              ? "px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              : cn(
                  buttonVariants({ size: "sm", variant: "ghost" }),
                  "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
          }
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
      </div>
    )
  }

  if (variant === "landing") {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
        >
          Get started
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <SignInButton mode="modal">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground hover:bg-accent hover:text-foreground",
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
    </div>
  )
}
