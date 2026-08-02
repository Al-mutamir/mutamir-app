
"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"

import { auth } from "@/lib/firebase/config"
import type { User } from "@/lib/firebase/interface/user"

import {
  createUser,
  getUserById,
  updateUserRole as updateUserRoleService,
} from "@/lib/firebase/services/user"

type UserRole = User["role"] | null

interface AuthContextType {
  user: User | null
  loading: boolean

  signUp: (
    email: string,
    password: string,
    role: User["role"],
    displayName: string,
    gender?: string
  ) => Promise<FirebaseUser>

  signIn: (
    email: string,
    password: string
  ) => Promise<FirebaseUser>

  /**
   * Sign in with Google.
   * If `selectedRole` is provided and the Google account is new,
   * the Firestore user document will be created immediately.
   * If `selectedRole` is omitted and the Google account is new,
   * the flow will pause and the UI should prompt the user to
   * choose a role before creating the Firestore user.
   */
  signInWithGoogle: (
    selectedRole?: User["role"]
  ) => Promise<FirebaseUser>

  /**
   * If a Google sign-in created a pending account (no Firestore
   * user yet), this will hold the Firebase user until the UI
   * completes registration by choosing a role.
   */
  pendingGoogleUser: FirebaseUser | null

  /**
   * Complete a pending Google registration by creating the
   * Firestore user document using the chosen role.
   */
  completeGoogleRegistration: (
    role: User["role"]
  ) => Promise<void>

  logout: () => Promise<void>

  resetPassword: (email: string) => Promise<void>

  updateUserRole: (role: User["role"]) => Promise<void>

  userRole: UserRole
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined)

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * When a Google sign-in happens and there is no corresponding
   * Firestore user document, we keep the Firebase user here until
   * the UI completes role selection and calls completeGoogleRegistration.
   */
  const [pendingGoogleUser, setPendingGoogleUser] = useState<FirebaseUser | null>(null)

  const router = useRouter()

  /**
   * Load the Al-Mutamir application user from Firestore.
   *
   * Firebase Authentication is the source of truth for:
   * - uid
   * - email
   * - displayName
   * - photoURL
   *
   * Firestore is the source of truth for:
   * - role
   * - status
   * - onboardingCompleted
   * - application-specific profile data
   */
  const loadUser = async (
    firebaseUser: FirebaseUser
  ): Promise<User | null> => {
    const userData = await getUserById(
      firebaseUser.uid
    )

    if (!userData) {
      return null
    }

    /**
     * Build the application user without introducing
     * undefined values where possible.
     */
    return {
      ...userData,

      uid: firebaseUser.uid,

      ...(firebaseUser.email
        ? { email: firebaseUser.email }
        : {}),

      ...(firebaseUser.displayName
        ? {
            displayName:
              firebaseUser.displayName,
          }
        : {}),

      ...(firebaseUser.photoURL
        ? {
            photoURL:
              firebaseUser.photoURL,
          }
        : {}),
    }
  }

  /**
   * Listen for Firebase Authentication state changes.
   */
  useEffect(() => {
    if (!auth) {
      console.error("Auth not initialized")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true)

        try {
          if (!firebaseUser) {
            setUser(null)
            return
          }

          const userData =
            await loadUser(firebaseUser)

          if (!userData) {
            /**
             * Firebase Auth account exists but there is
             * no corresponding Firestore user document.
             *
             * Do not invent a role or create an
             * application user here.
             */
            console.warn(
              `No Firestore user found for Firebase UID: ${firebaseUser.uid}`
            )

            setUser(null)
            return
          }

          setUser(userData)
        } catch (error) {
          console.error(
            "Error loading authenticated user:",
            error
          )

          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return unsubscribe
  }, [])

  /**
   * Email/password registration.
   *
   * Creates:
   * 1. Firebase Authentication account
   * 2. One corresponding Firestore users/{uid} document
   *
   * firstName and lastName are REQUIRED.
   */
  const signUp = async (
    email: string,
    password: string,
    role: User["role"],
    displayName: string,
    gender?: string
  ): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    /**
     * Validate required fields here as well as on the
     * registration page.
     *
     * This protects the AuthContext from being called
     * incorrectly from another component.
     */
    const trimmedEmail = email.trim()
    const trimmedDisplayName =
      displayName.trim()

    if (!trimmedEmail) {
      throw new Error("Email is required.")
    }

    if (!password) {
      throw new Error("Password is required.")
    }

    if (!trimmedDisplayName) {
      throw new Error(
        "First name and last name are required."
      )
    }

    /**
     * Split display name into first and last name.
     */
    const nameParts =
      trimmedDisplayName
        .split(/\s+/)
        .filter(Boolean)

    const firstName = nameParts[0]

    const lastName =
      nameParts.length > 1
        ? nameParts
            .slice(1)
            .join(" ")
        : ""

    /**
     * First name and last name are mandatory.
     *
     * This should never happen when called from the
     * current registration page, but we enforce it
     * here too.
     */
    if (!firstName || !lastName) {
      throw new Error(
        "First name and last name are required."
      )
    }

    try {
      setLoading(true)

      /**
       * Create Firebase Authentication account.
       */
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        )

      const firebaseUser =
        userCredential.user

      /**
       * Update Firebase display name.
       */
      await updateProfile(firebaseUser, {
        displayName:
          trimmedDisplayName,
      })

      /**
       * Create the Firestore user.
       *
       * IMPORTANT:
       * Never include undefined values in Firestore data.
       */
      const newUser: Omit<User, "id"> = {
        uid: firebaseUser.uid,

        email:
          firebaseUser.email ??
          trimmedEmail,

        displayName:
          firebaseUser.displayName ??
          trimmedDisplayName,

        role,

        status: "unverified",

        onboardingCompleted: false,

        firstName,

        lastName,

        ...(firebaseUser.photoURL
          ? {
              photoURL:
                firebaseUser.photoURL,
            }
          : {}),

        ...(gender?.trim()
          ? {
              gender: gender.trim(),
            }
          : {}),
      }

      /**
       * This is the ONLY initial Firestore
       * user creation.
       */
      await createUser(newUser)

      /**
       * Keep local AuthContext state synchronized
       * immediately.
       */
      setUser({
        ...newUser,
        id: firebaseUser.uid,
      })

      return firebaseUser
    } catch (error) {
      console.error(
        "Error signing up:",
        error
      )

      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Email/password sign in.
   *
   * Firebase Authentication handles authentication.
   * The Firestore user document is loaded by
   * onAuthStateChanged.
   */
  const signIn = async (
    email: string,
    password: string
  ): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      setLoading(true)

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )

      return userCredential.user
    } catch (error) {
      console.error(
        "Error signing in:",
        error
      )

      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Google sign in / registration.
   *
   * Existing users keep their existing Firestore role.
   *
   * New Google users require a selected role and
   * receive an initial Firestore user document.
   */
  const signInWithGoogle = async (
    selectedRole?: User["role"]
  ): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      setLoading(true)

      const provider =
        new GoogleAuthProvider()

      const result =
        await signInWithPopup(
          auth,
          provider
        )

      const firebaseUser =
        result.user

      /**
       * Check whether this Firebase account
       * already has an Al-Mutamir user document.
       */
      const existingUser =
        await getUserById(
          firebaseUser.uid
        )

      /**
       * Existing application user.
       *
       * NEVER overwrite their role with the role
       * selected during another Google login.
       */
      if (existingUser) {
        return firebaseUser
      }

      /**
       * New Google account.
       *
       * If a role was supplied by the caller (registration flow),
       * create the Firestore user immediately. If no role was
       * supplied (common on the sign-in page), pause the flow and
       * let the UI prompt the user to choose a role.
       */
      if (!selectedRole) {
        // Do not create a Firestore user yet; hold the firebase user
        // in pending state so the UI can prompt for role selection.
        setPendingGoogleUser(firebaseUser)
        return firebaseUser
      }

      const roleToUse: User["role"] = selectedRole as User["role"]

      if (
        roleToUse !== "pilgrim" &&
        roleToUse !== "agency" &&
        roleToUse !== "admin"
      ) {
        throw new Error(
          "A valid account role is required for Google registration."
        )
      }

      /**
       * Google may or may not provide a display name.
       *
       * Since firstName and lastName are required,
       * we cannot create a valid application user
       * unless Google provides a usable full name.
       */
      const displayName =
        firebaseUser.displayName?.trim()

      if (!displayName) {
        throw new Error(
          "Google did not provide your name. Please complete registration with your first and last name."
        )
      }

      const nameParts =
        displayName
          .split(/\s+/)
          .filter(Boolean)

      const firstName =
        nameParts[0]

      const lastName =
        nameParts.length > 1
          ? nameParts
              .slice(1)
              .join(" ")
          : ""

      /**
       * First and last name are mandatory.
       */
      if (!firstName || !lastName) {
        throw new Error(
          "Google registration requires both a first name and a last name."
        )
      }

      /**
       * Create Firestore user.
       *
       * IMPORTANT:
       * Optional Firebase fields are conditionally
       * added so Firestore never receives undefined.
       */
      const newUser: Omit<User, "id"> = {
        uid: firebaseUser.uid,

        email:
          firebaseUser.email ?? "",

        displayName,

        role: roleToUse,

        status: "unverified",

        onboardingCompleted: false,

        firstName,

        lastName,

        ...(firebaseUser.photoURL
          ? {
              photoURL:
                firebaseUser.photoURL,
            }
          : {}),
      }

      /**
       * Create exactly one Firestore user document.
       */
      await createUser(newUser)

      /**
       * Synchronize local state.
       */
      setUser({
        ...newUser,
        id: firebaseUser.uid,
      })

      return firebaseUser
    } catch (error) {
      console.error(
        "Error signing in with Google:",
        error
      )

      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Complete a pending Google registration by creating the
   * Firestore user document using the chosen role.
   */
  const completeGoogleRegistration = async (
    role: User["role"]
  ): Promise<void> => {
    if (!pendingGoogleUser) {
      throw new Error("No pending Google user to complete registration for.")
    }

    const firebaseUser = pendingGoogleUser

    if (
      role !== "pilgrim" &&
      role !== "agency" &&
      role !== "admin"
    ) {
      throw new Error("A valid account role is required.")
    }

    const displayName = firebaseUser.displayName?.trim()

    if (!displayName) {
      throw new Error(
        "Google did not provide your name. Please provide your first and last name."
      )
    }

    const nameParts = displayName.split(/\s+/).filter(Boolean)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    if (!firstName || !lastName) {
      throw new Error(
        "Google registration requires both a first name and a last name."
      )
    }

    const newUser: Omit<User, "id"> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      displayName,
      role,
      status: "unverified",
      onboardingCompleted: false,
      firstName,
      lastName,
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
    }

    try {
      setLoading(true)

      await createUser(newUser)

      setUser({ ...newUser, id: firebaseUser.uid })

      // Clear pending state
      setPendingGoogleUser(null)
    } catch (error) {
      console.error("Error completing Google registration:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout.
   */
  const logout = async (): Promise<void> => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      await signOut(auth)

      setUser(null)

      router.push("/")
    } catch (error) {
      console.error(
        "Error signing out:",
        error
      )

      throw error
    }
  }

  /**
   * Password reset.
   */
  const resetPassword = async (
    email: string
  ): Promise<void> => {
    if (!auth) {
      throw new Error("Auth not initialized")
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      )
    } catch (error) {
      console.error(
        "Error resetting password:",
        error
      )

      throw error
    }
  }

  /**
   * Update the authenticated user's role.
   *
   * Role changes should only happen through
   * authorized account-management functionality.
   */
  const updateUserRole = async (
    role: User["role"]
  ): Promise<void> => {
    if (!user) {
      throw new Error(
        "No authenticated user"
      )
    }

    try {
      await updateUserRoleService(
        user.uid,
        role
      )

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              role,
            }
          : null
      )
    } catch (error) {
      console.error(
        "Error updating user role:",
        error
      )

      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,

    signUp,
    signIn,
    signInWithGoogle,

    pendingGoogleUser,
    completeGoogleRegistration,

    logout,
    resetPassword,

    updateUserRole,

    userRole:
      user?.role ?? null,
  }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    )
  }

  return context
}
