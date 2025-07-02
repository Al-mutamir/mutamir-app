import { Loader2 } from "lucide-react"

export function Loader({
  className = "",
  size = "medium",
}: { className?: string; size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
    </div>
  )
}
