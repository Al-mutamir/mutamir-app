"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton({ className = "", variant = "ghost", size = "sm" }) {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <Button onClick={handleLogout} variant={variant} size={size} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}

export default LogoutButton
