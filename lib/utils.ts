import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Remove "1. " / "1) " prefixes when the UI also renders ordered-list markers. */
export function stripLeadingListMarker(text: string): string {
  return text.replace(/^\s*\d+[\.\)]\s+/, "")
}
