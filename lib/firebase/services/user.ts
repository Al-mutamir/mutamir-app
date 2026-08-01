// This file provides a set of functions to interact with the Firestore database for user-related operations. It includes functions to get all users, get a user by ID or email, get users by role, create a new user, update user information, update user roles, handle onboarding updates, and verify agencies. Each function handles errors gracefully and logs them to the console.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "../config"
import type { User } from "../interface/user"

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.")
  }

  return db
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const firestore = checkDb()

    const snapshot = await getDocs(collection(firestore, "users"))

    return snapshot.docs.map((userDoc) => ({
      id: userDoc.id,
      ...(userDoc.data() as Omit<User, "id">),
    }))
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

/**
 * Get user by Firebase Auth UID / Firestore document ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const firestore = checkDb()

    const snapshot = await getDoc(doc(firestore, "users", userId))

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<User, "id">),
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  email: string
): Promise<User | null> {
  try {
    const firestore = checkDb()

    const snapshot = await getDocs(
      query(
        collection(firestore, "users"),
        where("email", "==", email)
      )
    )

    if (snapshot.empty) {
      return null
    }

    const userDoc = snapshot.docs[0]

    return {
      id: userDoc.id,
      ...(userDoc.data() as Omit<User, "id">),
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: User["role"]
): Promise<User[]> {
  try {
    const firestore = checkDb()

    const snapshot = await getDocs(
      query(
        collection(firestore, "users"),
        where("role", "==", role)
      )
    )

    return snapshot.docs.map((userDoc) => ({
      id: userDoc.id,
      ...(userDoc.data() as Omit<User, "id">),
    }))
  } catch (error) {
    console.error("Error getting users by role:", error)
    return []
  }
}

/**
 * Create a new user profile
 *
 * The Firestore document ID is the Firebase Auth UID.
 *
 * Registration should call this once after Firebase Authentication
 * successfully creates the account.
 */
export async function createUser(
  user: Omit<User, "id">
): Promise<void> {
  try {
    const firestore = checkDb()

    await setDoc(doc(firestore, "users", user.uid), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

/**
 * Update user
 *
 * Used for general user profile updates.
 */
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  try {
    const firestore = checkDb()

    const { id, uid, createdAt, ...safeData } = data

    await updateDoc(doc(firestore, "users", userId), {
      ...safeData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

/**
 * Update user role
 *
 * This should only be used by trusted account-management logic.
 * It should not be driven by a URL parameter or arbitrary client input.
 */
export async function updateUserRole(
  userId: string,
  role: User["role"]
): Promise<void> {
  try {
    const firestore = checkDb()

    await updateDoc(doc(firestore, "users", userId), {
      role,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

/**
 * Update onboarding data
 *
 * Onboarding can update the user's profile information, but it cannot
 * change the user's UID, email, role, verification status, or timestamps.
 *
 * Completing onboarding always sets:
 *
 * onboardingCompleted = true
 */
export async function updateUserOnboarding(
  userId: string,
  onboardingData: Partial<User>
): Promise<void> {
  try {
    const firestore = checkDb()

    const {
      id,
      uid,
      email,
      role,
      status,
      onboardingCompleted,
      createdAt,
      updatedAt,
      ...profileData
    } = onboardingData

    await updateDoc(doc(firestore, "users", userId), {
      ...profileData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating onboarding:", error)
    throw error
  }
}

/**
 * Verify an agency
 *
 * Agency verification is separate from onboarding.
 *
 * Completing agency onboarding does NOT verify the agency.
 *
 * The agency must first have:
 *
 * status = "unverified"
 *
 * and after approval:
 *
 * status = "verified"
 */
export async function verifyAgency(
  agencyId: string
): Promise<void> {
  try {
    const firestore = checkDb()

    await updateDoc(doc(firestore, "users", agencyId), {
      status: "verified",
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error verifying agency:", error)
    throw error
  }
}

/**
 * Get all pilgrims
 */
export async function getPilgrims(): Promise<User[]> {
  return getUsersByRole("pilgrim")
}

/**
 * Get all agencies
 */
export async function getAgencies(): Promise<User[]> {
  return getUsersByRole("agency")
}

/**
 * Get all admins
 */
export async function getAdmins(): Promise<User[]> {
  return getUsersByRole("admin")
}