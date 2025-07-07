"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { serverTimestamp } from "firebase/firestore"; // Import serverTimestamp

export type UserRole = "pilgrim" | "agency" | "admin" | null

export interface AuthUser {
  uid: string
  email: string | null
  agencyName?: string | null
  displayName: string | null
  photoURL: string | null
  role?: UserRole
  onboardingCompleted?: boolean
  gender?: string
  phoneNumber?: string | null
  adminRole?: string
  passportNumber?: string | null
}

// Define context type
type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole, displayName?: string, gender?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  // MODIFIED: signInWithGoogle now accepts a selectedRole
  signInWithGoogle: (selectedRole: UserRole) => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserRole: (role: UserRole) => Promise<void>
  userRole: UserRole
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Firestore helpers
const getUserData = async (uid: string) => {
  if (!db) {
    console.error("Firestore not initialized")
    return null
  }

  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

const setUserData = async (uid: string, data: any) => {
  if (!db) {
    console.error("Firestore not initialized")
    return
  }

  try {
    await setDoc(doc(db, "users", uid), data, { merge: true }) // Use merge: true to avoid overwriting
  } catch (error) {
    console.error("Error setting user data:", error)
    throw error
  }
}

const updateUserRole = async (uid: string, role: UserRole) => {
  if (!db) {
    console.error("Firestore not initialized")
    return
  }

  try {
    await updateDoc(doc(db, "users", uid), { role })
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// Create provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const router = useRouter()

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe = () => {}

    if (auth) {
      const authStateListener = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            // Get user data from Firestore
            const userData = await getUserData(currentUser.uid)

            // Check if email is from almutamir.com domain (admin)
            const isAdminEmail = currentUser.email?.endsWith("@almutamir.com") || false

            if (userData) {
              // User exists in Firestore, set role from Firestore data
              const userWithRole: AuthUser = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || userData.displayName,
                photoURL: currentUser.photoURL,
                role: isAdminEmail ? "admin" : userData.role, // Admin role takes precedence
                onboardingCompleted: userData.onboardingCompleted || false,
                gender: userData.gender || "male",
                adminRole: userData.adminRole,
              }

              setUser(userWithRole)
              setUserRole(isAdminEmail ? "admin" : userData.role)

              // Store user role in a cookie for middleware access
              document.cookie = `user-role=${isAdminEmail ? "admin" : userData.role || ""}; path=/; max-age=86400`
              document.cookie = `onboarding-completed=${userData.onboardingCompleted ? "true" : "false"}; path=/; max-age=86400`
            } else {
              // User doesn't exist in Firestore yet (might be a new social login)
              // Set default role as null until explicitly set, or admin if from almutamir.com domain
              const initialRole = isAdminEmail ? "admin" : null; // Keep role null for new non-admin social logins
              setUser({
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: initialRole,
                onboardingCompleted: false,
                gender: "male",
              })
              setUserRole(initialRole)

              // Store user role in a cookie for middleware access
              document.cookie = `user-role=${initialRole || ""}; path=/; max-age=86400`
              document.cookie = "onboarding-completed=false; path=/; max-age=86400"
            }
          } catch (error) {
            console.error("Error fetching user data:", error)

            // Check if email is from almutamir.com domain (admin)
            const isAdminEmail = currentUser.email?.endsWith("@almutamir.com") || false

            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: isAdminEmail ? "admin" : null,
              onboardingCompleted: false,
              gender: "male",
            })
            setUserRole(isAdminEmail ? "admin" : null)

            // Store user role in a cookie for middleware access
            document.cookie = `user-role=${isAdminEmail ? "admin" : ""}; path=/; max-age=86400`
            document.cookie = "onboarding-completed=false; path=/; max-age=86400"
          }
        } else {
          setUser(null)
          setUserRole(null)

          // Clear role cookies
          document.cookie = "user-role=; path=/; max-age=0"
          document.cookie = "onboarding-completed=; path=/; max-age=0"
        }
        setLoading(false)
      })

      unsubscribe = authStateListener
    } else {
      console.error("Auth not initialized")
      setLoading(false)
    }

    return () => unsubscribe()
  }, [])

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole, displayName?: string, gender = "male") => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user

      // Set display name if provided
      if (displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName })
      }

      // Check if email is from almutamir.com domain (admin)
      const isAdminEmail = email.endsWith("@almutamir.com")
      const userFinalRole = isAdminEmail ? "admin" : role // Use a different variable name to avoid confusion

      // Store user data in Firestore
      await setUserData(newUser.uid, {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName || null,
        role: userFinalRole, // Use the determined final role
        photoURL: newUser.photoURL,
        onboardingCompleted: false,
        gender: gender,
        createdAt: serverTimestamp(), // Add timestamp
      })

      setUserRole(userFinalRole)

      // Store user role in a cookie for middleware access
      document.cookie = `user-role=${userFinalRole || ""}; path=/; max-age=86400`
      document.cookie = "onboarding-completed=false; path=/; max-age=86400"

      return userCredential
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Check if email is from almutamir.com domain (admin)
      const isAdminEmail = email.endsWith("@almutamir.com")

      // Get user data from Firestore
      const userData = await getUserData(userCredential.user.uid)

      if (userData) {
        // If email is from almutamir.com, set role to admin regardless of what's in Firestore
        const role = isAdminEmail ? "admin" : userData.role
        setUserRole(role)

        // Store user role in a cookie for middleware access
        document.cookie = `user-role=${role || ""}; path=/; max-age=86400`
        document.cookie = `onboarding-completed=${userData.onboardingCompleted ? "true" : "false"}; path=/; max-age=86400`

        // Add role to the user object for easier access
        ;(userCredential.user as any).role = role
        ;(userCredential.user as any).onboardingCompleted = userData.onboardingCompleted || false
        ;(userCredential.user as any).gender = userData.gender || "male"
        ;(userCredential.user as any).adminRole = userData.adminRole
      } else if (isAdminEmail) {
        // New admin user, create entry in Firestore
        await setUserData(userCredential.user.uid, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          role: "admin",
          photoURL: userCredential.user.photoURL,
          onboardingCompleted: false,
          gender: "male",
          createdAt: serverTimestamp(), // Add timestamp
        })

        setUserRole("admin")

        // Store user role in a cookie for middleware access
        document.cookie = "user-role=admin; path=/; max-age=86400"
        document.cookie = "onboarding-completed=false; path=/; max-age=86400"

        // Add role to the user object for easier access
        ;(userCredential.user as any).role = "admin"
        ;(userCredential.user as any).onboardingCompleted = false
      }

      return userCredential
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  // MODIFIED: signInWithGoogleAuth now accepts selectedRole
  const signInWithGoogleAuth = async (selectedRole: UserRole) => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if email is from almutamir.com domain (admin)
      const isAdminEmail = user.email?.endsWith("@almutamir.com") || false

      // Check if user exists in Firestore
      const userData = await getUserData(user.uid)

      if (!userData) {
        // First time login with Google, create user in Firestore with the selected role
        // If email is from almutamir.com, set role to admin (admin role takes precedence)
        const roleToSet = isAdminEmail ? "admin" : selectedRole || "pilgrim"; // Default to pilgrim if selectedRole is null

        await setUserData(user.uid, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: roleToSet, // Use the selected/determined role
          photoURL: user.photoURL,
          onboardingCompleted: false,
          gender: "male", // Default gender
          createdAt: serverTimestamp(), // Add timestamp
        })

        setUserRole(roleToSet)

        // Store user role in a cookie for middleware access
        document.cookie = `user-role=${roleToSet || ""}; path=/; max-age=86400`
        document.cookie = "onboarding-completed=false; path=/; max-age=86400"

        // Add role to the user object for easier access
        ;(user as any).role = roleToSet
        ;(user as any).onboardingCompleted = false
        ;(user as any).gender = "male"
      } else {
        // User exists in Firestore, just update the local state and cookies
        // If email is from almutamir.com, set role to admin regardless of what's in Firestore
        const role = isAdminEmail ? "admin" : userData.role
        setUserRole(role)

        // Store user role in a cookie for middleware access
        document.cookie = `user-role=${role || ""}; path=/; max-age=86400`
        document.cookie = `onboarding-completed=${userData.onboardingCompleted ? "true" : "false"}; path=/; max-age=86400`

        // Add role to the user object for easier access
        ;(user as any).role = role
        ;(user as any).onboardingCompleted = userData.onboardingCompleted || false
        ;(user as any).gender = userData.gender || "male"
        ;(user as any).adminRole = userData.adminRole
      }

      return result
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      await signOut(auth)
      setUserRole(null)

      // Clear role cookies
      document.cookie = "user-role=; path=/; max-age=0"
      document.cookie = "onboarding-completed=; path=/; max-age=0"

      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  // Update user role function
  const updateUserRoleFunc = async (role: UserRole) => {
    if (user) {
      try {
        // Update role in Firestore
        await updateUserRole(user.uid, role)
        setUserRole(role)

        // Update local user state
        setUser((prev) => (prev ? { ...prev, role } : null))

        // Update role cookie
        document.cookie = `user-role=${role || ""}; path=/; max-age=86400`
      } catch (error) {
        console.error("Error updating user role:", error)
        throw error
      }
    }
  }

  // Create context value
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle: signInWithGoogleAuth, // Reference the modified function
    logout,
    resetPassword,
    updateUserRole: updateUserRoleFunc,
    userRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Client-side role handler component
export function ClientRoleHandler({ children }: { children: React.ReactNode }) {
  const { user, userRole, updateUserRole } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Get role from URL query parameter
    // Only process if user exists, not already processing, and current userRole is null
    // This null check is important for new social sign-ups where role hasn't been explicitly set yet
    if (typeof window !== "undefined" && user && !isProcessing && userRole === null) {
      const params = new URLSearchParams(window.location.search)
      const roleParam = params.get("role") as UserRole

      // If a role is in the URL and it's different from the current user's (null for new social)
      if (roleParam && roleParam !== userRole) { // Also ensure roleParam is not null
        setIsProcessing(true)
        updateUserRole(roleParam).finally(() => setIsProcessing(false))
      }
    }
  }, [user, userRole, updateUserRole, isProcessing])

  return <>{children}</>
}

// Create a wrapper component that includes the RoleHandler
export function AuthProviderWithRoleHandler({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientRoleHandler>{children}</ClientRoleHandler>
    </AuthProvider>
  )
}