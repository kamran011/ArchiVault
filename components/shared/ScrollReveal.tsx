"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ScrollRevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: "div" | "section"
}

export function ScrollReveal({ children, className, delay = 0, as = "div" }: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = as === "section" ? sectionRef.current : ref.current
    if (!el) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [as])

  const motionClass = cn(
    "transition-all duration-300 ease-out motion-reduce:transition-none",
    visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
    className,
  )
  const style = { transitionDelay: visible ? `${delay}ms` : "0ms" }

  if (as === "section") {
    return (
      <section ref={sectionRef} className={motionClass} style={style}>
        {children}
      </section>
    )
  }

  return (
    <div ref={ref} className={motionClass} style={style}>
      {children}
    </div>
  )
}
