import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] p-6 text-zinc-100">
      <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/dashboard" appearance={{ variables: { colorPrimary: "#06b6d4" } }} />
    </main>
  )
}