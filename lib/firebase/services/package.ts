// lib/firebase/services/package.ts

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  QueryConstraint,
} from "firebase/firestore"

import { db } from "../config"
import type { Package, PackageStatus, PackageType } from "../interface/package"

const COLLECTION_NAME = "packages"

function packageCollection() {
  if (!db) {
    throw new Error("Firestore is not initialized.")
  }

  return collection(db, COLLECTION_NAME)
}

function packageDoc(id: string) {
  if (!db) {
    throw new Error("Firestore is not initialized.")
  }

  return doc(db, COLLECTION_NAME, id)
}

function mapPackage(document: any): Package {
  return {
    id: document.id,
    ...(document.data() as Omit<Package, "id">),
  }
}

/* -------------------------------------------------------------------------- */
/*                                   GETTERS                                  */
/* -------------------------------------------------------------------------- */

export async function getAllPackages(): Promise<Package[]> {
  const snapshot = await getDocs(
    query(packageCollection(), orderBy("createdAt", "desc"))
  )

  return snapshot.docs.map(mapPackage)
}

export async function getPublishedPackages(): Promise<Package[]> {
  const snapshot = await getDocs(
    query(
      packageCollection(),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    )
  )

  return snapshot.docs.map(mapPackage)
}

export async function getPackageById(
  packageId: string
): Promise<Package | null> {
  const snapshot = await getDoc(packageDoc(packageId))

  if (!snapshot.exists()) {
    return null
  }

  return mapPackage(snapshot)
}

export async function getPackagesByAgency(
  agencyId: string
): Promise<Package[]> {
  const snapshot = await getDocs(
    query(
      packageCollection(),
      where("agencyId", "==", agencyId),
      orderBy("createdAt", "desc")
    )
  )

  return snapshot.docs.map(mapPackage)
}

/* -------------------------------------------------------------------------- */
/*                                  FILTERS                                   */
/* -------------------------------------------------------------------------- */

export async function getPackagesByStatus(
  status: PackageStatus
): Promise<Package[]> {
  const snapshot = await getDocs(
    query(
      packageCollection(),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    )
  )

  return snapshot.docs.map(mapPackage)
}

export async function getPackagesByType(
  type: PackageType
): Promise<Package[]> {
  const snapshot = await getDocs(
    query(
      packageCollection(),
      where("type", "==", type),
      orderBy("createdAt", "desc")
    )
  )

  return snapshot.docs.map(mapPackage)
}

export async function getPackagesByDestination(
  destination: string
): Promise<Package[]> {
  const snapshot = await getDocs(
    query(
      packageCollection(),
      where("destination", "==", destination),
      where("status", "==", "active")
    )
  )

  return snapshot.docs.map(mapPackage)
}

export async function getFeaturedPackages(
  max = 6
): Promise<Package[]> {
  const snapshot = await getDocs(
    query(
      packageCollection(),
      where("featured", "==", true),
      where("status", "==", "active"),
      limit(max)
    )
  )

  return snapshot.docs.map(mapPackage)
}

/* -------------------------------------------------------------------------- */
/*                                  MUTATION                                  */
/* -------------------------------------------------------------------------- */

export async function createPackage(
  packageData: Omit<
    Package,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<string> {
  const document = await addDoc(packageCollection(), {
    ...packageData,
    status: packageData.status ?? "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return document.id
}

export async function updatePackage(
  packageId: string,
  data: Partial<Package>
): Promise<void> {
  await updateDoc(packageDoc(packageId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function publishPackage(
  packageId: string
): Promise<void> {
  return updatePackage(packageId, {
    status: "active",
  })
}

export async function archivePackage(
  packageId: string
): Promise<void> {
  return updatePackage(packageId, {
    status: "archived",
  })
}

export async function markPackageFull(
  packageId: string
): Promise<void> {
  return updatePackage(packageId, {
    status: "full",
  })
}

export async function restorePackage(
  packageId: string
): Promise<void> {
  return updatePackage(packageId, {
    status: "active",
  })
}

export async function deletePackage(
  packageId: string
): Promise<void> {
  await deleteDoc(packageDoc(packageId))
}