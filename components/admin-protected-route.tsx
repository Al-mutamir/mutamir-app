"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Wait for auth to initialize
        if (loading) return

        // Check if user is logged in and has admin role
        if (user && user.role === "admin") {
          setIsAuthorized(true)
        } else {
          // Not authorized, redirect to login
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/auth/login")
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminAccess()
  }, [user, loading, router])

  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
