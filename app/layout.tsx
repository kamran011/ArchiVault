import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/shared/ThemeProvider"
import { ThemedToaster } from "@/components/shared/ThemedToaster"

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.archivolt.dev"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Archivolt | Volatility-based architecture planning",
  description:
    "Design your system around change with Volatility-Based Decomposition \u2014 stable interfaces for volatile axes, Mermaid diagrams, and a roadmap you can ship.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, "dark")}>
      <body
        className={cn(
          jetbrainsMono.variable,
          "font-sans bg-background text-foreground antialiased",
        )}
      >
        <ThemeProvider>
          <ClerkProvider
            afterSignOutUrl="/"
            domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim() || "www.archivolt.dev"}
          >
            {children}
            <ThemedToaster />
          </ClerkProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
