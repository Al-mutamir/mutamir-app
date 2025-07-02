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

const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
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
