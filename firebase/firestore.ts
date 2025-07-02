import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  where,
  addDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "./config"
import type { UserRole } from "@/context/auth-context"

// Initialize Firestore
// export const db = getFirestore(app) // This line is removed because db is now imported from config

// User data interface
export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  photoURL?: string | null
  createdAt?: Date
  updatedAt?: Date
  agencyName?: string
  managerName?: string
  countryOfOperation?: string
  cityOfOperation?: string
  phoneNumber?: string
  alternativeEmail?: string
  averagePilgrimsPerYear?: number
  servicesOffered?: any
  onboardingCompleted?: boolean
  passportNumber?: string
  countryOfResidence?: string
  cityOfResidence?: string
  age?: number
  gender?: string
  nextOfKin?: string
  nextOfKinPhone?: string
  nextOfKinEmail?: string
  verified?: boolean
}

// Package data interface
export interface Package {
  id?: string
  title: string
  description: string
  price: number
  duration: number
  inclusions: string[]
  exclusions: string[]
  agencyId: string
  agencyName?: string
  status?: "active" | "draft" | "archived"
  groupSize?: number
  type?: string
  startDate?: string
  endDate?: string
  accommodationType?: string
  transportation?: string
  meals?: string
  availableDates?: { startDate: string; endDate: string }[]
  createdAt?: any
  updatedAt?: any
  rating?: number
  itinerary?: { title: string; description: string }[]
}

// Booking interface
export interface Booking {
  id: string
  packageId: string
  packageTitle: string
  pilgrimId: string
  userEmail: string
  countryOfResidence?: string
  cityOfResidence?: string
  passportNumber?: string
  agencyId: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  travelDate: Date | string
  returnDate: Date | string
  totalPrice: number
  paymentStatus: "unpaid" | "partial" | "paid"
  paymentReference?: string
  createdAt?: any
  updatedAt?: any
  highlights?: string[]
  notes?: string
  rating?: number
}

// Check Firestore database instance
function checkDb() {
  if (!db) {
    throw new Error("Firestore database instance is not initialized.")
  }
}

// Create or update user in Firestore
export async function setUserData(uid: string, data: Partial<UserData>): Promise<void> {
  checkDb()
  const userRef = doc(db!, "users", uid)
  const now = new Date()
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) {
    await updateDoc(userRef, {
      ...data,
      updatedAt: now,
    })
  } else {
    await setDoc(userRef, {
      uid,
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  checkDb()
  const userRef = doc(db!, "users", uid)
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) {
    return userDoc.data() as UserData
  } else {
    return null
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  checkDb()
  const userRef = doc(db!, "users", uid)
  await updateDoc(userRef, {
    role,
    updatedAt: new Date(),
  })
}

export async function updateUserOnboardingData(uid: string, data: any): Promise<void> {
  checkDb()
  const userRef = doc(db!, "users", uid)
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
  checkDb()
  try {
    const userRef = doc(db!, "users", uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user data:", error)
    throw error
  }
}

export async function getPackages(): Promise<Package[]> {
  checkDb()
  try {
    const packagesCollection = collection(db!, "packages")
    const packagesSnapshot = await getDocs(packagesCollection)
    const packages = packagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Package[]
    return packages.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error getting packages:", error)
    throw error
  }
}

export async function getPackagesByAgency(agencyId: string): Promise<Package[]> {
  checkDb()
  try {
    const packagesRef = collection(db!, "packages")
    const q = query(packagesRef, where("agencyId", "==", agencyId))
    const querySnapshot = await getDocs(q)
    const packages = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Package,
    )
    return packages.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error getting packages by agency:", error)
    return []
  }
}

export async function getPublishedPackages(): Promise<Package[]> {
  checkDb()
  try {
    const packagesRef = collection(db!, "packages")
    const q = query(packagesRef, where("status", "==", "active"))
    const querySnapshot = await getDocs(q)
    const packages = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Package,
    )
    const verifiedPackages = []
    for (const pkg of packages) {
      if (pkg.agencyId === "admin") {
        verifiedPackages.push(pkg)
        continue
      }
      const agencyRef = doc(db!, "users", pkg.agencyId)
      const agencyDoc = await getDoc(agencyRef)
      if (agencyDoc.exists() && agencyDoc.data().verified) {
        verifiedPackages.push(pkg)
      }
    }
    return verifiedPackages.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error getting published packages:", error)
    return []
  }
}

export async function getPackageById(packageId: string): Promise<Package | null> {
  checkDb()
  try {
    const docRef = doc(db!, "packages", packageId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Package
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting package:", error)
    throw error
  }
}

export async function createPackage(packageData: Omit<Package, "id" | "updatedAt">): Promise<string> {
  checkDb()
  try {
    const packagesRef = collection(db!, "packages")
    const docRef = await addDoc(packagesRef, {
      ...packageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating package:", error)
    throw error
  }
}

export async function updatePackage(id: string, data: Partial<Package>): Promise<void> {
  checkDb()
  try {
    const packageRef = doc(db!, "packages", id)
    await updateDoc(packageRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating package:", error)
    throw error
  }
}

export async function publishPackage(id: string): Promise<void> {
  checkDb()
  try {
    const packageRef = doc(db!, "packages", id)
    await updateDoc(packageRef, {
      status: "active",
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error publishing package:", error)
    throw error
  }
}

export async function deletePackage(id: string): Promise<void> {
  checkDb()
  try {
    const packageRef = doc(db!, "packages", id)
    await deleteDoc(packageRef)
  } catch (error) {
    console.error("Error deleting package:", error)
    throw error
  }
}

export async function getBookingsByAgency(agencyId: string): Promise<Booking[]> {
  checkDb()
  try {
    const bookingsRef = collection(db!, "bookings")
    const q = query(bookingsRef, where("agencyId", "==", agencyId))
    const querySnapshot = await getDocs(q)
    const bookings = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Booking,
    )
    return bookings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error getting bookings by agency:", error)
    return []
  }
}

export async function getBookingsByPilgrim(pilgrimId: string): Promise<Booking[]> {
  checkDb()
  try {
    const bookingsRef = collection(db!, "bookings")
    const q = query(bookingsRef, where("pilgrimId", "==", pilgrimId))
    const querySnapshot = await getDocs(q)
    const bookings = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Booking,
    )
    return bookings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error getting bookings by pilgrim:", error)
    return []
  }
}

export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<string> {
  checkDb()
  try {
    const bookingsRef = collection(db!, "bookings")
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<void> {
  checkDb()
  try {
    const bookingRef = doc(db!, "bookings", id)
    await updateDoc(bookingRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    throw error
  }
}

export async function updateBookingPayment(
  id: string,
  data: { paymentStatus: string; paymentReference: string; paymentDate: Date },
): Promise<void> {
  checkDb()
  try {
    const bookingRef = doc(db!, "bookings", id)
    await updateDoc(bookingRef, {
      paymentStatus: data.paymentStatus,
      paymentReference: data.paymentReference,
      paymentDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating booking payment status:", error)
    throw error
  }
}

export async function getBookings(): Promise<Booking[]> {
  checkDb()
  try {
    const bookingsRef = collection(db!, "bookings")
    const querySnapshot = await getDocs(bookingsRef)
    const bookings = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Booking,
    )
    return bookings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Error getting all bookings:", error)
    return []
  }
}

export async function getAgencies(): Promise<UserData[]> {
  checkDb()
  try {
    const usersRef = collection(db!, "users")
    const q = query(usersRef, where("role", "==", "agency"))
    const querySnapshot = await getDocs(q)
    const agencies = querySnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
        }) as UserData,
    )
    return agencies
  } catch (error) {
    console.error("Error getting agencies:", error)
    return []
  }
}

export async function updateAgencyVerification(agencyId: string, verified: boolean): Promise<void> {
  checkDb()
  try {
    const agencyRef = doc(db!, "users", agencyId)
    await updateDoc(agencyRef, {
      verified,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating agency verification:", error)
    throw error
  }
}

export async function getBookingById(bookingId: string) {
  checkDb()
  try {
    const bookingRef = doc(db!, "bookings", bookingId)
    const bookingSnap = await getDoc(bookingRef)
    if (bookingSnap.exists()) {
      return { id: bookingSnap.id, ...bookingSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting booking by ID:", error)
    throw error
  }
}
