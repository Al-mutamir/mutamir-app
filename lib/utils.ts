import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDateFns } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Parse various date shapes (Firestore Timestamp, plain string, number, Date)
export function parseDate(value: any): Date | null {
  if (!value && value !== 0) return null
  if (value instanceof Date) return value
  if (typeof value === "string") {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === "number") return new Date(value)
  if (typeof value === "object") {
    // Firestore Timestamp object with toDate()
    if (typeof (value as any).toDate === "function") {
      try {
        return (value as any).toDate()
      } catch (e) {
        return null
      }
    }
    // Legacy shape with seconds field
    if (typeof (value as any).seconds === "number") {
      return new Date((value as any).seconds * 1000)
    }
  }
  return null
}

// Format a date-like value into a human readable string. Returns "Unknown" when not parseable.
export function formatDate(value: any, fmt = "MMM d, yyyy"): string {
  const d = parseDate(value)
  if (!d) return "Unknown"
  try {
    return formatDateFns(d, fmt)
  } catch (e) {
    return d.toLocaleDateString()
  }
}
