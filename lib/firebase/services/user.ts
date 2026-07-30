// lib/firebase/services/user.ts

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
} from "firebase/firestore";

import { db } from "../config";

import type { User } from "../interface/user";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }

  return db;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(collection(firestore, "users"));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDoc(doc(firestore, "users", userId));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<User, "id">),
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  email: string
): Promise<User | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "users"),
        where("email", "==", email)
      )
    );

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];

    return {
      id: userDoc.id,
      ...(userDoc.data() as Omit<User, "id">),
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: User["role"]
): Promise<User[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "users"),
        where("role", "==", role)
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
}

/**
 * Create user
 */
export async function createUser(
  user: Omit<User, "id">
): Promise<void> {
  try {
    const firestore = checkDb();

    await setDoc(doc(firestore, "users", user.uid), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "users", userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: User["role"]
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "users", userId), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Update onboarding data
 */
export async function updateUserOnboarding(
  userId: string,
  onboardingData: Partial<User>
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "users", userId), {
      ...onboardingData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    throw error;
  }
}

/**
 * Verify agency
 */
export async function verifyAgency(
  agencyId: string,
  verified: boolean
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "users", agencyId), {
      verified,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error verifying agency:", error);
    throw error;
  }
}

/**
 * Get all pilgrims
 */
export async function getPilgrims(): Promise<User[]> {
  return getUsersByRole("pilgrim");
}

/**
 * Get all agencies
 */
export async function getAgencies(): Promise<User[]> {
  return getUsersByRole("agency");
}

/**
 * Get all admins
 */
export async function getAdmins(): Promise<User[]> {
  return getUsersByRole("admin");
}