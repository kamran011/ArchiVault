import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] p-6 text-zinc-100">
      <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/dashboard" appearance={{ variables: { colorPrimary: "#06b6d4" } }} />
    </main>
  )
}