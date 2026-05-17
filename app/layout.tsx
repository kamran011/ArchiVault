import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "Archivolt | Volatility-based architecture planning",
  description:
    "Design your system around change with Volatility-Based Decomposition \u2014 stable interfaces for volatile axes, Mermaid diagrams, and a roadmap you can ship.",
  icons: {
    icon: "/favicon.ico",
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
          <ClerkProvider afterSignOutUrl="/">
            {children}
            <ThemedToaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
