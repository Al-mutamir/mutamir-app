"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithEmailAndPassword, getAuth } from "firebase/auth"
import { getUserData } from "@/firebase/firestore"

export default function AdminAuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const router = useRouter()
  const auth = getAuth()

  // Check if admin is already authenticated
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check if admin is already logged in
        const currentUser = auth.currentUser
        if (currentUser) {
          // Get user data from Firestore
          const userData = await getUserData(currentUser.uid)

          // Check if user has admin role
          if (userData && userData.role === "admin") {
            // Admin is authenticated, redirect to dashboard
            router.push("/admin/dashboard")
            return
          }
        }
        setIsVerifying(false)
      } catch (err) {
        console.error("Error verifying admin access:", err)
        setIsVerifying(false)
      }
    }

    checkAdminAuth()
  }, [router, auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Get user data from Firestore
      const userData = await getUserData(userCredential.user.uid)

      // Check if user has admin role
      if (userData && userData.role === "admin") {
        // Store admin status in localStorage for client-side checks
        localStorage.setItem("admin-authenticated", "true")

        // Redirect to admin dashboard
        router.push("/admin/dashboard")
      } else {
        // User doesn't have admin role
        await auth.signOut()
        setError("You don't have admin privileges")
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Image src="/images/logo.png" alt="Almutamir Logo" width={180} height={48} priority />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifying admin access...</h2>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-8">
          <Image src="/images/logo.png" alt="Almutamir Logo" width={180} height={48} priority />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button className="w-full py-6" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
