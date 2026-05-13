import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Archivolt | Volatility-based architecture planning",
  description:
    "Design your system around change with Volatility-Based Decomposition — stable interfaces for volatile axes, Mermaid diagrams, and a roadmap you can ship.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark bg-zinc-950", inter.variable)}>
      <body
        className={cn(
          jetbrainsMono.variable,
          "font-sans bg-zinc-950 text-zinc-100",
        )}
      >
        <ClerkProvider afterSignOutUrl="/">
          {children}
          <Toaster richColors theme="dark" position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  )
}
