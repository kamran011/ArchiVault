import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/dashboard" appearance={{ variables: { colorPrimary: "#06b6d4" } }} />
    </main>
  )
}