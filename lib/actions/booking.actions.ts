import { db } from "@/lib/firebase/config"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"

/**
 * Fetches a booking by its ID
 * @param id The booking ID
 * @returns The booking data or null if not found
 */
export async function getBooking(id) {
  try {
    if (!id) {
      console.error("No booking ID provided")
      return null
    }

    const bookingRef = doc(db, "bookings", id)
    const bookingSnap = await getDoc(bookingRef)

    if (!bookingSnap.exists()) {
      console.error(`Booking with ID ${id} not found`)
      return null
    }

    return {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    }
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

/**
 * Fetches all bookings for a specific pilgrim
 * @param pilgrimId The pilgrim's user ID
 * @returns Array of booking data
 */
export async function getPilgrimBookings(pilgrimId) {
  try {
    if (!pilgrimId) {
      console.error("No pilgrim ID provided")
      return []
    }

    const bookingsQuery = query(collection(db, "bookings"), where("pilgrimId", "==", pilgrimId))

    const bookingsSnap = await getDocs(bookingsQuery)

    if (bookingsSnap.empty) {
      return []
    }

    return bookingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching pilgrim bookings:", error)
    return []
  }
}

/**
 * Fetches all bookings for a specific agency
 * @param agencyId The agency's ID
 * @returns Array of booking data
 */
export async function getAgencyBookings(agencyId) {
  try {
    if (!agencyId) {
      console.error("No agency ID provided")
      return []
    }

    const bookingsQuery = query(collection(db, "bookings"), where("agencyId", "==", agencyId))

    const bookingsSnap = await getDocs(bookingsQuery)

    if (bookingsSnap.empty) {
      return []
    }

    return bookingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching agency bookings:", error)
    return []
  }
}

/**
 * Fetches all bookings for a specific package
 * @param packageId The package ID
 * @returns Array of booking data
 */
export async function getPackageBookings(packageId) {
  try {
    if (!packageId) {
      console.error("No package ID provided")
      return []
    }

    const bookingsQuery = query(collection(db, "bookings"), where("packageId", "==", packageId))

    const bookingsSnap = await getDocs(bookingsQuery)

    if (bookingsSnap.empty) {
      return []
    }

    return bookingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching package bookings:", error)
    return []
  }
}

/**
 * Fetches all bookings in the system
 * @returns Array of all booking data
 */
export async function getAllBookings() {
  try {
    const bookingsSnap = await getDocs(collection(db, "bookings"))

    if (bookingsSnap.empty) {
      return []
    }

    return bookingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching all bookings:", error)
    return []
  }
}

// Export alias for compatibility from "./booking.actions"
