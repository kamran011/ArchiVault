import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/dashboard" appearance={{ variables: { colorPrimary: "#06b6d4" } }} />
    </main>
  )
}