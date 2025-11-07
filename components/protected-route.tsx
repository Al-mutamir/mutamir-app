"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
  requiredRole?: string
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect unauthenticated users to the auth login page
      router.push("/auth/login")
      return
    }

    // If allowedRoles specified and user exists, enforce role-based access
    if (!loading && user && allowedRoles && allowedRoles.length > 0) {
      const role = (user as any).role || null

      // If the user has no role yet (e.g. new social signup) we should not kick
      // them back to the homepage. Instead show a loading state until the role
      // is resolved. Only redirect when role is present and not allowed.
      if (!role) {
        return
      }

      if (!allowedRoles.includes(role)) {
        // Redirect users without the required role to their dashboard
        if (role === "pilgrim") router.push("/dashboard/pilgrim")
        else if (role === "agency") router.push("/dashboard/agency")
        else if (role === "admin") router.push("/dashboard/admin")
        else router.push("/")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // or a loading indicator, or redirect, etc.
  }

  return <>{children}</>
}

export { ProtectedRoute }
export default ProtectedRoute
