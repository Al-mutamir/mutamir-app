"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, ArrowLeft, Eye, EyeOff, Mail, Lock, Check } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getUserData } from "@/lib/firebase/firestore"

type UserData = {
  id: string
  onboardingCompleted: boolean
  role: "admin" | "pilgrim" | "agency"
  // Add other fields if needed
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { signIn, signInWithGoogle, loading, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAuth() {
      if (user && !isRedirecting) {
        setIsRedirecting(true)
        try {
          const userData = await getUserData(user.uid) as UserData
          if (userData) {
                // Always redirect to dashboard; onboarding enforcement is handled by middleware
                if (userData.role === "admin") {
                  router.push("/dashboard/admin")
                } else if (userData.role === "agency") {
                  router.push("/dashboard/agency")
                } else if (userData.role === "pilgrim") {
                  router.push("/dashboard/pilgrim")
                } else {
                  router.push("/")
                }
          }
        } catch (err) {
          console.error("Error checking auth:", err)
          setIsRedirecting(false)
        }
      }
    }

    checkAuth()
  }, [user, isRedirecting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Admin bypass check
    if (email === "admin@bypass.com" && password === "#admin**") {
      toast({
        title: "Admin Login Successful!",
        description: "Welcome to the admin dashboard.",
        duration: 3000,
      })

      setIsRedirecting(true)
      window.location.href = "/dashboard/admin"
      return
    }

    try {
      const userCredential = await signIn(email, password)

      // Check if email is from almutamir.com domain (admin)
      const isAdminEmail = email.endsWith("@almutamir.com")

      // Get user data from Firestore
      const userData = await getUserData(userCredential.user.uid) as UserData

      toast({
        title: "Login Successful!",
        description: "Welcome back.",
        duration: 3000,
      })

      if (userData) {
        // Force navigation after successful login using window.location
        if (!userData.onboardingCompleted) {
          if (isAdminEmail) {
            window.location.href = "/onboarding/admin"
          } else {
            window.location.href = `/onboarding/${userData.role}`
          }
        } else {
          if (userData.role === "admin") {
            window.location.href = "/dashboard/admin"
          } else {
            window.location.href = userData.role === "pilgrim" ? "/dashboard/pilgrim" : "/dashboard/agency"
          }
        }
      }
    } catch (err: any) {
      console.error("Login error:", err)

      // Handle specific Firebase auth errors
      let errorMessage = "An error occurred during login"

      if (err.code) {
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMessage = "Invalid email or password. Please check your credentials and try again."
            break
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address."
            break
          case "auth/user-disabled":
            errorMessage = "This account has been disabled. Please contact support."
            break
          case "auth/too-many-requests":
            errorMessage = "Too many failed login attempts. Please try again later."
            break
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection and try again."
            break
          default:
            errorMessage = err.message || "Login failed. Please try again."
        }
      } else {
        errorMessage = err.message || "Login failed. Please try again."
      }

      setError(errorMessage)
      setIsRedirecting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      const userEmail = result.user.email || ""

      // Check if email is from almutamir.com domain (admin)
      const isAdminEmail = userEmail.endsWith("@almutamir.com")

      // Get user data from Firestore
      const userData = await getUserData(result.user.uid) as UserData

      toast({
        title: "Google Sign-In Successful!",
        description: "Welcome back.",
        duration: 3000,
      })

      if (userData) {
        // Force navigation after successful login using window.location
        if (!userData.onboardingCompleted) {
          if (isAdminEmail) {
            window.location.href = "/onboarding/admin"
          } else {
            window.location.href = `/onboarding/${userData.role}`
          }
        } else {
          if (userData.role === "admin") {
            window.location.href = "/dashboard/admin"
          } else {
            window.location.href = userData.role === "pilgrim" ? "/dashboard/pilgrim" : "/dashboard/agency"
          }
        }
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err)

      let errorMessage = "Google sign-in failed"

      if (err.code) {
        switch (err.code) {
          case "auth/popup-closed-by-user":
            errorMessage = "Sign-in was cancelled. Please try again."
            break
          case "auth/popup-blocked":
            errorMessage = "Popup was blocked. Please allow popups and try again."
            break
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection and try again."
            break
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Please try again later."
            break
          default:
            errorMessage = err.message || "Google sign-in failed. Please try again."
        }
      } else {
        errorMessage = err.message || "Google sign-in failed. Please try again."
      }

      setError(errorMessage)
      setIsRedirecting(false)
    }
  }

  // If already redirecting, show loading state
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Image src="/images/logo.png" alt="Al-Mutamir Logo" width={180} height={48} priority />
          </div>
          <h2 className="text-2xl font-bold mb-2">Redirecting to your dashboard...</h2>
          <p className="text-gray-500">Please wait while we prepare your experience.</p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-10 lg:p-20">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex justify-center mb-8">
          <Image src="/images/logo.png" alt="Al-Mutamir Logo" width={180} height={48} priority />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray-500 mt-2">Welcome back to Al-Mutamir</p>
        </div>

        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            New to Al-Mutamir?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>

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
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
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

          <Button className="w-full py-6" type="submit" disabled={loading || isRedirecting}>
            {loading || isRedirecting ? "Signing in..." : "Sign in"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || isRedirecting}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Google
          </Button>
        </form>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
        {/* Background Image with low opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/images/makkah.jpg?height=1080&width=1920')" }}
        ></div>

        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-4/5 z-10">
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold mb-2">Secure Pilgrimage Planning</h3>
            <p className="text-gray-600 mb-4">Your journey, your data, your peace of mind</p>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">End-to-end encryption</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg relative">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-primary/30 rounded-full"></div>
            <h3 className="text-lg font-semibold mb-4">Why choose Al-Mutamir?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-sm">Trusted by thousands of pilgrims</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-sm">Verified agencies and packages</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-sm">Seamless booking experience</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full"></div>
      </div>
    </div>
  )
}
