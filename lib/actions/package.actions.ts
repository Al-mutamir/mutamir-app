import { db } from "@/lib/firebase/config"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"

/**
 * Fetches a package by its ID
 * @param id The package ID
 * @returns The package data or null if not found
 */
export async function getPackageById(id) {
  try {
    if (!id) {
      console.error("No package ID provided")
      return null
    }

    const packageRef = doc(db, "packages", id)
    const packageSnap = await getDoc(packageRef)

    if (!packageSnap.exists()) {
      console.error(`Package with ID ${id} not found`)
      return null
    }

    return {
      id: packageSnap.id,
      ...packageSnap.data(),
    }
  } catch (error) {
    console.error("Error fetching package:", error)
    return null
  }
}

/**
 * Fetches all packages for a specific agency
 * @param agencyId The agency's ID
 * @returns Array of package data
 */
export async function getAgencyPackages(agencyId) {
  try {
    if (!agencyId) {
      console.error("No agency ID provided")
      return []
    }

    const packagesQuery = query(collection(db, "packages"), where("agencyId", "==", agencyId))

    const packagesSnap = await getDocs(packagesQuery)

    if (packagesSnap.empty) {
      return []
    }

    return packagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching agency packages:", error)
    return []
  }
}

/**
 * Fetches all packages of a specific type (Hajj or Umrah)
 * @param type The package type ("Hajj" or "Umrah")
 * @returns Array of package data
 */
export async function getPackagesByType(type) {
  try {
    if (!type) {
      console.error("No package type provided")
      return []
    }

    const packagesQuery = query(collection(db, "packages"), where("type", "==", type))

    const packagesSnap = await getDocs(packagesQuery)

    if (packagesSnap.empty) {
      return []
    }

    return packagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error(`Error fetching ${type} packages:`, error)
    return []
  }
}

/**
 * Fetches all packages in the system
 * @returns Array of all package data
 */
export async function getAllPackages() {
  try {
    const packagesSnap = await getDocs(collection(db, "packages"))

    if (packagesSnap.empty) {
      return []
    }

    return packagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching all packages:", error)
    return []
  }
}

/**
 * Fetches featured packages
 * @param limit Number of packages to fetch (default: 4)
 * @returns Array of featured package data
 */
export async function getFeaturedPackages(limit = 4) {
  try {
    const packagesQuery = query(collection(db, "packages"), where("featured", "==", true))

    const packagesSnap = await getDocs(packagesQuery)

    if (packagesSnap.empty) {
      // Fallback to regular packages if no featured ones exist
      const allPackagesSnap = await getDocs(collection(db, "packages"))
      return allPackagesSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .slice(0, limit)
    }

    return packagesSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching featured packages:", error)
    return []
  }
}
