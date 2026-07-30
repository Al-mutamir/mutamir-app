// lib/firebase/services/packages.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config";

import type { Package } from "../interface/package";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }

  return db;
}

/**
 * Get all packages
 */
export async function getAllPackages(): Promise<Package[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "packages"),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Package, "id">),
    }));
  } catch (error) {
    console.error("Error getting packages:", error);
    return [];
  }
}

/**
 * Get only published (active) packages
 */
export async function getPublishedPackages(): Promise<Package[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "packages"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Package, "id">),
    }));
  } catch (error) {
    console.error("Error getting published packages:", error);
    return [];
  }
}

/**
 * Get package by ID
 */
export async function getPackageById(
  packageId: string
): Promise<Package | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDoc(doc(firestore, "packages", packageId));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Package, "id">),
    };
  } catch (error) {
    console.error("Error getting package:", error);
    return null;
  }
}

/**
 * Get packages owned by an agency
 */
export async function getPackagesByAgency(
  agencyId: string
): Promise<Package[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "packages"),
        where("agencyId", "==", agencyId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Package, "id">),
    }));
  } catch (error) {
    console.error("Error getting agency packages:", error);
    return [];
  }
}

/**
 * Create package
 */
export async function createPackage(
  packageData: Omit<Package, "id">
): Promise<string> {
  try {
    const firestore = checkDb();

    const docRef = await addDoc(collection(firestore, "packages"), {
      ...packageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating package:", error);
    throw error;
  }
}

/**
 * Update package
 */
export async function updatePackage(
  packageId: string,
  data: Partial<Package>
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "packages", packageId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating package:", error);
    throw error;
  }
}

/**
 * Publish package
 */
export async function publishPackage(
  packageId: string
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "packages", packageId), {
      status: "active",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error publishing package:", error);
    throw error;
  }
}

/**
 * Archive package
 */
export async function archivePackage(
  packageId: string
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "packages", packageId), {
      status: "archived",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error archiving package:", error);
    throw error;
  }
}

/**
 * Delete package
 */
export async function deletePackage(
  packageId: string
): Promise<void> {
  try {
    const firestore = checkDb();

    await deleteDoc(doc(firestore, "packages", packageId));
  } catch (error) {
    console.error("Error deleting package:", error);
    throw error;
  }
}