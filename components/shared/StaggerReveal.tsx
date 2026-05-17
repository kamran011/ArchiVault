"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const StaggerVisibleContext = React.createContext(false)

type StaggerGroupProps = {
  children: React.ReactNode
  className?: string
}

export function StaggerGroup({ children, className }: StaggerGroupProps) {
  const ref = React.useRef<HTMLUListElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <StaggerVisibleContext.Provider value={visible}>
      <ul ref={ref} className={className}>
        {children}
      </ul>
    </StaggerVisibleContext.Provider>
  )
}

type StaggerItemProps = {
  index: number
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ index, children, className }: StaggerItemProps) {
  const visible = React.useContext(StaggerVisibleContext)

  return (
    <li
      className={cn(
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${index * 50}ms` : "0ms" }}
    >
      {children}
    </li>
  )
}
