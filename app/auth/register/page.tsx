"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, ArrowLeft, Eye, EyeOff, User, Mail, Lock, Check, Users, Building } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserRole } from "@/types/auth"
import { getUserData, setUserData, updateUserProfile } from "@/lib/firebase/firestore"
import { sendWelcomeEmail } from "@/utils/sendWelcomeEmail"

// Constants
const THEME_COLORS = {
  primary: '#008000',
  primaryHover: '#006400',
  primaryLight: '#008000',
  success: '#4CAF50',
} as const

const MIN_PASSWORD_LENGTH = 8

type UserData = {
  id: string
  role: UserRole
  onboardingCompleted: boolean
  status?: string
}

// Utility function for Discord notification
async function notifyDiscordAgencyRegistration({ 
  firstName, 
  lastName, 
  email 
}: { 
  firstName: string
  lastName: string
  email: string 
}) {
  try {
    const webhookUrl = "https://discordapp.com/api/webhooks/1374112883260002304/LR9DEcBQPEl2OQ6AWVS9JNUQlZaXt2os3o54zCTD8iIgYDoUYhmrEjD1-2Do099xw7SB"
    const content = `🏢 **New Agency Registration**
**Name:** ${firstName} ${lastName}
**Email:** ${email}
Status: unverified`
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
  } catch (err) {
    console.error("Failed to notify Discord (agency registration):", err)
  }
}

// Password validation helper
const validatePassword = (password: string) => {
  return {
    hasMinLength: password.length >= MIN_PASSWORD_LENGTH,
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

// Get user-friendly error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('email-already-in-use')) {
      return "This email is already registered. Please sign in instead."
    }
    if (message.includes('invalid-email')) {
      return "Please enter a valid email address."
    }
    if (message.includes('weak-password')) {
      return "Password is too weak. Please choose a stronger password."
    }
    if (message.includes('network')) {
      return "Network error. Please check your connection and try again."
    }
    
    return error.message
  }
  
  return "An unexpected error occurred. Please try again."
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "pilgrim" as UserRole,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { signUp, loading, signInWithGoogle, user } = useAuth()
  const navigation = useRouter()
  const { toast } = useToast()

  // Handle Google sign-up redirect with proper state management
  useEffect(() => {
    const handleGoogleRedirect = async () => {
      if (user?.uid && !isSubmitting) {
        try {
          const userData = await getUserData(user.uid) as UserData | null
          
          if (userData) {
            const targetRole = userData.role
            const needsOnboarding = !userData.onboardingCompleted
            
            navigation.push(
              needsOnboarding 
                ? `/onboarding/${targetRole}` 
                : `/dashboard/${targetRole}`
            )
          } else {
            // New user from Google sign-up, redirect to onboarding
            navigation.push(`/onboarding/${formData.role}`)
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
          setError("Failed to complete sign-up. Please try again.")
        }
      }
    }

    handleGoogleRedirect()
  }, [user, isSubmitting, formData.role, navigation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }))
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password)
  const { hasMinLength, hasNumber, hasUppercase, hasLowercase, hasSpecialChar } = passwordValidation
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && hasSpecialChar
  const canSubmit = isPasswordValid && passwordsMatch && !loading && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting || loading) return
    
    setError("")

    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements")
      return
    }

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`

    setIsSubmitting(true)

    try {
      const userCredential = await signUp(formData.email, formData.password, formData.role, fullName)
      
      if (!userCredential?.user?.uid) {
        throw new Error("Failed to create user account")
      }

      // Prepare user data based on role
      const baseUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        role: formData.role,
      }

      const userData = formData.role === "agency" 
        ? { ...baseUserData, status: "unverified" }
        : baseUserData

      // Single atomic write to Firestore
      await setUserData(userCredential.user.uid, userData)

      // Send welcome email (non-blocking)
      sendWelcomeEmail(formData.email, fullName).catch(err => {
        console.error("Failed to send welcome email:", err)
      })

      // Notify Discord for agency registrations (non-blocking)
      if (formData.role === "agency") {
        notifyDiscordAgencyRegistration({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email,
        }).catch(err => {
          console.error("Discord notification failed:", err)
        })
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to Al-Mutamir.",
        duration: 3000,
      })

      // Redirect to onboarding
      navigation.push(`/onboarding/${formData.role}`)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      console.error("Registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (isSubmitting || loading) return
    
    setError("")
    setIsSubmitting(true)

    try {
      await signInWithGoogle(formData.role)

      toast({
        title: "Registration Successful!",
        description: "Welcome to Al-Mutamir.",
        duration: 3000,
      })
      
      // useEffect will handle redirect based on user state
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      console.error("Google sign-up error:", err)
      setIsSubmitting(false)
    }
  }

  // Get validation message for submit button
  const getSubmitButtonMessage = () => {
    if (isSubmitting || loading) return "Creating account..."
    if (!isPasswordValid) return "Complete password requirements"
    if (!passwordsMatch && formData.confirmPassword) return "Passwords must match"
    return "Create account"
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-10 lg:p-20">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex justify-center mb-8">
          <Image src="/images/logo.png" alt="Al-Mutamir Logo" width={180} height={48} priority />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-gray-500 mt-2">Create your Al-Mutamir account</p>
        </div>

        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">I am a:</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange("pilgrim")}
              disabled={isSubmitting || loading}
              aria-pressed={formData.role === "pilgrim"}
              className={`relative flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.role === "pilgrim"
                  ? `border-[${THEME_COLORS.primary}] bg-[${THEME_COLORS.primary}]/5 shadow-sm`
                  : "border-gray-200 hover:border-gray-300"
              } ${(isSubmitting || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Users className={`h-6 w-6 ${formData.role === "pilgrim" ? `text-[${THEME_COLORS.primary}]` : "text-gray-500"}`} />
                <span className={`font-medium ${formData.role === "pilgrim" ? `text-[${THEME_COLORS.primary}]` : "text-gray-700"}`}>
                  Pilgrim
                </span>
              </div>
              {formData.role === "pilgrim" && (
                <div className={`absolute -top-2 -right-2 bg-[${THEME_COLORS.primary}] text-white rounded-full p-1`}>
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("agency")}
              disabled={isSubmitting || loading}
              aria-pressed={formData.role === "agency"}
              className={`relative flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.role === "agency"
                  ? `border-[${THEME_COLORS.primary}] bg-[${THEME_COLORS.primary}]/5 shadow-sm`
                  : "border-gray-200 hover:border-gray-300"
              } ${(isSubmitting || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Building className={`h-6 w-6 ${formData.role === "agency" ? `text-[${THEME_COLORS.primary}]` : "text-gray-500"}`} />
                <span className={`font-medium ${formData.role === "agency" ? `text-[${THEME_COLORS.primary}]` : "text-gray-700"}`}>
                  Agency
                </span>
              </div>
              {formData.role === "agency" && (
                <div className={`absolute -top-2 -right-2 bg-[${THEME_COLORS.primary}] text-white rounded-full p-1`}>
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Already a member?{" "}
            <Link href="/auth/login" className={`font-medium text-[${THEME_COLORS.primary}] hover:underline`}>
              Sign in
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  id="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  disabled={isSubmitting || loading}
                  required 
                  className="pl-10"
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </Label>
              <Input 
                id="lastName" 
                value={formData.lastName} 
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

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
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
                className="pl-10"
                autoComplete="email"
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
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
                className="pl-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || loading}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password requirements */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs">
                <div
                  className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${hasMinLength ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {hasMinLength ? <Check className="h-3 w-3" /> : null}
                </div>
                <span className={hasMinLength ? "text-green-600" : "text-gray-500"}>At least {MIN_PASSWORD_LENGTH} characters</span>
              </div>
              <div className="flex items-center text-xs">
                <div
                  className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${hasNumber ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {hasNumber ? <Check className="h-3 w-3" /> : null}
                </div>
                <span className={hasNumber ? "text-green-600" : "text-gray-500"}>At least one number (0-9)</span>
              </div>
              <div className="flex items-center text-xs">
                <div
                  className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${hasUppercase && hasLowercase ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {hasUppercase && hasLowercase ? <Check className="h-3 w-3" /> : null}
                </div>
                <span className={hasUppercase && hasLowercase ? "text-green-600" : "text-gray-500"}>
                  Uppercase (A-Z) and lowercase (a-z)
                </span>
              </div>
              <div className="flex items-center text-xs">
                <div
                  className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${hasSpecialChar ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {hasSpecialChar ? <Check className="h-3 w-3" /> : null}
                </div>
                <span className={hasSpecialChar ? "text-green-600" : "text-gray-500"}>
                  Special character (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting || loading}
                required
                className="pl-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || loading}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="flex items-center text-xs mt-2">
                <div
                  className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${passwordsMatch ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                >
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                </div>
                <span className={passwordsMatch ? "text-green-600" : "text-red-600"}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          <Button
            className={`w-full py-6 bg-[${THEME_COLORS.primary}] hover:bg-[${THEME_COLORS.primaryHover}] transition-colors`}
            type="submit"
            disabled={!canSubmit}
          >
            {getSubmitButtonMessage()}
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
            className="w-full transition-colors" 
            onClick={handleGoogleSignUp} 
            disabled={isSubmitting || loading}
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
            {(isSubmitting || loading) ? "Signing up..." : "Google"}
          </Button>
        </form>
      </div>

      {/* Right side - Decorative */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[${THEME_COLORS.primary}] to-[${THEME_COLORS.success}] relative overflow-hidden`}>
        {/* Background Image with low opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/images/makkah.jpg?height=1080&width=1920')" }}
        />

        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-4/5 z-10">
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold mb-2">Your Pilgrimage Journey Starts Here</h3>
            <p className="text-gray-600 mb-4">Join thousands of pilgrims who trust Al-Mutamir</p>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full bg-[${THEME_COLORS.primary}]/20 flex items-center justify-center`}>
                <Check className={`h-4 w-4 text-[${THEME_COLORS.primary}]`} />
              </div>
              <span className="text-sm">Secure and private</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg relative">
            <div className={`absolute -top-12 -right-12 w-24 h-24 bg-[${THEME_COLORS.primary}]/20 rounded-full`} />
            <div className={`absolute -bottom-8 -left-8 w-16 h-16 bg-[${THEME_COLORS.primary}]/30 rounded-full`} />
            <h3 className="text-lg font-semibold mb-4">Benefits of joining</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className={`h-5 w-5 text-[${THEME_COLORS.primary}] mr-2 mt-0.5 flex-shrink-0`} />
                <span className="text-sm">Access to exclusive packages</span>
              </li>
              <li className="flex items-start">
                <Check className={`h-5 w-5 text-[${THEME_COLORS.primary}] mr-2 mt-0.5 flex-shrink-0`} />
                <span className="text-sm">Personalized pilgrimage planning</span>
              </li>
              <li className="flex items-start">
                <Check className={`h-5 w-5 text-[${THEME_COLORS.primary}] mr-2 mt-0.5 flex-shrink-0`} />
                <span className="text-sm">Connect with verified agencies</span>
              </li>
              <li className="flex items-start">
                <Check className={`h-5 w-5 text-[${THEME_COLORS.primary}] mr-2 mt-0.5 flex-shrink-0`} />
                <span className="text-sm">Secure booking and payments</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}