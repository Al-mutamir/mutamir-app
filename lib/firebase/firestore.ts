import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  WriteBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { Package, Booking } from "@/firebase/firestore"

// Helper function to check if Firestore is initialized
const checkDb = () => {
  if (!db) {
    console.warn("Firestore not initialized")
    return false
  }
  return true
}

// Get all packages
export const getAllPackages = async () => {
  try {
    if (!checkDb()) return []

    const packagesRef = collection(db!, "packages")
    const q = query(packagesRef, where("status", "==", "active"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const packages: any[] = []
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return packages
  } catch (error) {
    console.error("Error fetching packages:", error)

    // If it's a missing index error, return empty array instead of throwing
    if (
      typeof error === "object" &&
      error !== null &&
      ("code" in error || "message" in error)
    ) {
      const err = error as { code?: string; message?: string }
      if (
        err.code === "failed-precondition" ||
        (typeof err.message === "string" && err.message.includes("index"))
      ) {
        console.warn("Firestore index not available, returning empty array")
        return []
      }
    }

    throw error
  }
}

// Get package by ID
export const getPackageById = async (packageId: string): Promise<Package | null> => {
  try {
    if (!checkDb()) return null

    const packageRef = doc(db!, "packages", packageId)
    const packageSnap = await getDoc(packageRef)

    if (packageSnap.exists()) {
      return { id: packageSnap.id, ...packageSnap.data() } as Package
    } else {
      console.log("No package found with ID:", packageId)
      return null
    }
  } catch (error) {
    console.error("Error fetching package:", error)
    return null
  }
}

// Get packages by agency
export const getPackagesByAgency = async (agencyId: string) => {
  try {
    if (!checkDb()) return []

    const packagesRef = collection(db!, "packages")
    const q = query(packagesRef, where("agencyId", "==", agencyId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const packages: any[] = []
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return packages
  } catch (error) {
    console.error("Error fetching agency packages:", error)
    return []
  }
}

// Get bookings by agency
export const getBookingsByAgency = async (agencyId: string) => {
  try {
    if (!checkDb()) return []

    // First get all packages for this agency
    const agencyPackages: any[] = await getPackagesByAgency(agencyId)
    const packageIds: string[] = agencyPackages.map((pkg) => pkg.id)

    if (packageIds.length === 0) {
      return []
    }

    const bookingsRef = collection(db!, "bookings")
    const allBookings: any[] = []

    // Firestore doesn't support "in" queries with array length > 10
    // So we need to batch this for agencies with many packages
    const batchSize = 10
    for (let i = 0; i < packageIds.length; i += batchSize) {
      const batchIds = packageIds.slice(i, i + batchSize)
      const q = query(bookingsRef, where("packageId", "in", batchIds), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        const bookingData = doc.data()
        allBookings.push({
          id: doc.id,
          ...bookingData,
          paymentStatus: bookingData.paymentStatus || "pending",
          // Add package title for display purposes
          packageTitle: agencyPackages.find((pkg) => pkg.id === bookingData.packageId)?.title || "Unknown Package",
        })
      })
    }

    // Sort all bookings by creation date (newest first)
    allBookings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

    return allBookings
  } catch (error) {
    console.error("Error fetching agency bookings:", error)
    return []
  }
}

// Add to waitlist
export const addToWaitlist = async (waitlistData: { timestamp: Date; feature: string; name: string; email: string; phone: string; preferredContact: string; acceptTerms: boolean; notifyUpdates: boolean; userId: string | undefined }) => {
  if (!checkDb()) {
    throw new Error("Firestore not initialized")
  }

  try {
    const waitlistRef = collection(db!, "waitlists")
    const docRef = await addDoc(waitlistRef, {
      ...waitlistData,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error adding to waitlist:", error)
    throw error
  }
}

// Get user profile data
export async function getUserProfile(userId: unknown) {
  if (!userId) {
    console.error("getUserProfile: userId is undefined or null")
    return null
  }
  try {
    if (!checkDb()) return null

    const userRef = doc(db!, "users", userId as string)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      console.log("No user profile found!")
      return null
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Function to get user data (alias for getUserProfile for compatibility)
export async function getUserData(userId: string) {
  if (!userId) {
    console.error("getUserData: userId is undefined or null")
    return null
  }
  return getUserProfile(userId)
}

// Get user bookings
export async function getUserBookings(userId: string) {
  try {
    if (!checkDb()) return []

    const bookingsRef = collection(db!, "bookings")
    const q = query(bookingsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const bookings: any[] = []
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return bookings
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }
}

// Get user payment history
export async function getUserPaymentHistory(userId: unknown) {
  try {
    if (!checkDb()) return []

    const paymentsRef = collection(db!, "payments")
    const q = query(paymentsRef, where("userId", "==", userId), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    const payments: {
      // Ensure date is properly formatted
      date: any
      // Ensure amount is a number
      amount: number
      // Ensure status is a string
      status: any
      // Add description if missing
      description: any
      // Add method if missing
      method: any
      // Add reference if missing
      reference: any; id: string
    }[] = []
    querySnapshot.forEach((doc) => {
      const paymentData = doc.data()
      payments.push({
        id: doc.id,
        ...paymentData,
        // Ensure date is properly formatted
        date: paymentData.date ? paymentData.date : paymentData.createdAt,
        // Ensure amount is a number
        amount:
          typeof paymentData.amount === "number" ? paymentData.amount : Number.parseFloat(paymentData.amount) || 0,
        // Ensure status is a string
        status: paymentData.status || "pending",
        // Add description if missing
        description: paymentData.description || "Payment",
        // Add method if missing
        method: paymentData.method || "Card",
        // Add reference if missing
        reference: paymentData.reference || doc.id,
      })
    })

    return payments
  } catch (error) {
    console.error("Error fetching user payment history:", error)
    return []
  }
}

// Get pilgrim statistics and dashboard data
export async function getPilgrimStats(userId: string) {
  try {
    if (!checkDb()) {
      return {
        bookings: [],
        upcomingBookings: [],
        completedBookings: [],
        cancelledBookings: [],
        totalPaid: 0,
        recentActivity: [],
      }
    }

    // Get user bookings
    const bookings = await getUserBookings(userId)
    let totalPaid = 0

    bookings.forEach((booking) => {
      // Add to total paid if payment is confirmed
      if (booking.paymentStatus === "confirmed") {
        totalPaid += booking.totalPrice || 0
      }
    })

    // Sort bookings by departure date
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = a.departureDate ? new Date(a.departureDate) : new Date(0)
      const dateB = b.departureDate ? new Date(b.departureDate) : new Date(0)
      return dateA.getTime() - dateB.getTime()
    })

    // Filter bookings by status
    const now = new Date()
    const upcomingBookings = sortedBookings.filter((booking) => {
      const departureDate = booking.departureDate ? new Date(booking.departureDate) : null
      return departureDate && departureDate > now && booking.status !== "cancelled"
    })

    const completedBookings = sortedBookings.filter((booking) => {
      const departureDate = booking.departureDate ? new Date(booking.departureDate) : null
      return (departureDate && departureDate < now && booking.status === "completed") || booking.status === "completed"
    })

    const cancelledBookings = sortedBookings.filter((booking) => booking.status === "cancelled")

    // Get recent activity (payments and bookings)
    const recentActivity: { type: string; date: Date; data: any }[] = []

    // Add bookings to activity
    bookings.forEach((booking) => {
      recentActivity.push({
        type: "booking",
        date: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        data: booking,
      })
    })

    // Get payment records
    const payments = await getUserPaymentHistory(userId)

    payments.forEach((payment) => {
      recentActivity.push({
        type: "payment",
        date: payment.date ? new Date(payment.date) : new Date(),
        data: payment,
      })
    })

    // Sort activity by date (newest first)
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      bookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      totalPaid,
      recentActivity: recentActivity.slice(0, 10), // Return only the 10 most recent activities
    }
  } catch (error) {
    console.error("Error getting pilgrim stats:", error)
    // Return empty data structure on error
    return {
      bookings: [],
      upcomingBookings: [],
      completedBookings: [],
      cancelledBookings: [],
      totalPaid: 0,
      recentActivity: [],
    }
  }
}

// Get agency statistics
export async function getAgencyStats(agencyId: string) {
  try {
    if (!checkDb()) {
      return {
        packages: [],
        activePackages: 0,
        clients: [],
        totalClients: 0,
        totalRevenue: 0,
        recentBookings: [],
        upcomingTrips: [],
      }
    }

    // Get agency packages
    const packages = await getPackagesByAgency(agencyId)
    const now = new Date()
    // Upcoming trips: active packages with future departureDate
    const upcomingTrips = packages.filter(pkg => {
      if (pkg.status !== "active" || !pkg.departureDate) return false
      const dep = typeof pkg.departureDate === "object" && "toDate" in pkg.departureDate
        ? pkg.departureDate.toDate()
        : new Date(pkg.departureDate)
      return dep > now
    })

    // Get bookings for this agency
    const allBookings = await getBookingsByAgency(agencyId)
    // Sort bookings by createdAt (newest first)
    allBookings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
    // Recent bookings: last 5 bookings
    const recentBookings = allBookings.slice(0, 5)

    // ...other stats as before...

    return {
      packages,
      activePackages: packages.filter(pkg => pkg.status === "active").length,
      upcomingTrips,
      recentBookings,
      // ...other stats...
    }
  } catch (error) {
    console.error("Error getting agency stats:", error)
    return {
      packages: [],
      activePackages: 0,
      upcomingTrips: [],
      recentBookings: [],
    }
  }
}

// Get admin statistics
export async function getAdminStats() {
  try {
    if (!checkDb()) {
      return {
        totalUsers: 0,
        totalAgencies: 0,
        totalPackages: 0,
        totalBookings: 0,
        totalRevenue: 0,
        recentBookings: [],
      }
    }

    // Get counts from collections
    const usersRef = collection(db!, "users")
    const usersSnapshot = await getDocs(usersRef)
    const totalUsers = usersSnapshot.size

    const agenciesRef = collection(db!, "agencies")
    const agenciesSnapshot = await getDocs(agenciesRef)
    const totalAgencies = agenciesSnapshot.size

    const packagesRef = collection(db!, "packages")
    const packagesSnapshot = await getDocs(packagesRef)
    const totalPackages = packagesSnapshot.size

    const bookingsRef = collection(db!, "bookings")
    const bookingsQuery = query(bookingsRef, orderBy("createdAt", "desc"), limit(10))
    const bookingsSnapshot = await getDocs(bookingsQuery)

    let totalBookings = 0
    let totalRevenue = 0
    const recentBookings: any[] = []

    // Get total bookings count
    const allBookingsSnapshot = await getDocs(bookingsRef)
    totalBookings = allBookingsSnapshot.size

    // Calculate revenue and get recent bookings
    bookingsSnapshot.forEach((doc) => {
      const bookingData = doc.data()
      const booking = { id: doc.id, ...bookingData }
      recentBookings.push(booking)

      if (bookingData.paymentStatus === "confirmed") {
        totalRevenue += bookingData.totalPrice || 0
      }
    })

    return {
      totalUsers,
      totalAgencies,
      totalPackages,
      totalBookings,
      totalRevenue,
      recentBookings,
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    return {
      totalUsers: 0,
      totalAgencies: 0,
      totalPackages: 0,
      totalBookings: 0,
      totalRevenue: 0,
      recentBookings: [],
    }
  }
}

// Create a booking
export async function createBooking(bookingData: { packageId?: string; packageTitle?: string; paymentStatus?: string; paymentReference?: any; userName?: string | null; userEmail?: string | null; userPhone?: any; totalPrice?: number | undefined; packageType?: string; agencyId?: string | undefined; agencyName?: string | undefined; userId?: string; status?: any; createdAt?: Date; departureDate?: any; returnDate?: any; duration?: number | undefined; location?: string | undefined }) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const bookingsRef = collection(db!, "bookings")
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      status: bookingData.status || "pending",
      createdAt: serverTimestamp(),
    })

    return { id: docRef.id }
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

// Update a booking
export async function updateBooking(bookingId: string, data: Partial<Booking>) {
  const bookingRef = doc(db, "bookings", bookingId)
  await updateDoc(bookingRef, data)
}

// Update a booking's payment information
export async function updateBookingPayment(bookingId: string, paymentData: { paymentStatus: any; paymentReference: any; paymentDate: any; paymentMethod?: any }) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const bookingRef = doc(db!, "bookings", bookingId)

    // Get the current booking data
    const bookingSnap = await getDoc(bookingRef)
    if (!bookingSnap.exists()) {
      throw new Error(`Booking with ID ${bookingId} not found`)
    }

    // Update only the payment-related fields
    await updateDoc(bookingRef, {
      paymentStatus: paymentData.paymentStatus || "pending",
      paymentReference: paymentData.paymentReference || null,
      paymentDate: paymentData.paymentDate || serverTimestamp(),
      paymentMethod: paymentData.paymentMethod || "card",
      updatedAt: serverTimestamp(),
    })

    // If payment is successful, also record it in the payments collection
    if (paymentData.paymentStatus === "paid" || paymentData.paymentStatus === "confirmed") {
      const bookingData = bookingSnap.data()
      const paymentsRef = collection(db!, "payments")
      await addDoc(paymentsRef, {
        bookingId: bookingId,
        userId: bookingData.userId || null,
        packageId: bookingData.packageId || null,
        agencyId: bookingData.agencyId || null,
        amount: bookingData.totalPrice || 0,
        status: paymentData.paymentStatus,
        reference: paymentData.paymentReference,
        method: paymentData.paymentMethod || "card",
        date: paymentData.paymentDate || serverTimestamp(),
        createdAt: serverTimestamp(),
      })
    }

    return { id: bookingId, success: true }
  } catch (error) {
    console.error("Error updating booking payment:", error)
    throw error
  }
}

// Create a package
export async function createPackage(packageData: { title?: string; type?: string; price?: number; description?: string; duration?: number; agencyId?: string; agencyName?: string | null; handlerFirstName?: any; handlerLastName?: any; handlerFullName?: string; status: any; services?: { id: string; label: string; description: string }[]; itinerary?: { dayRange: string; title: string; description: string; location: string }[]; inclusions?: string[]; exclusions?: string[]; groupSize?: number; accommodationType?: string; transportation?: string; meals?: string; imageUrl?: string; imageName?: string; slots?: number }) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const packagesRef = collection(db!, "packages")
    const docRef = await addDoc(packagesRef, {
      ...packageData,
      status: packageData.status || "draft",
      createdAt: serverTimestamp(),
    })

    return { id: docRef.id }
  } catch (error) {
    console.error("Error creating package:", error)
    throw error
  }
}

// Update a package
export async function updatePackage(packageId: string, packageData: { title: string; type: string; price: number; description: string; duration: number; handlerFirstName: any; handlerLastName: any; handlerFullName: string; status: string; services: { id: string; label: string; description: string }[]; itinerary: never[]; inclusions: string[]; exclusions: string[]; groupSize: number; accommodationType: string; transportation: string; meals: string; imageUrl: string; imageName: string }) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const packageRef = doc(db!, "packages", packageId)
    await updateDoc(packageRef, {
      ...packageData,
      updatedAt: serverTimestamp(),
    })

    return { id: packageId }
  } catch (error) {
    console.error("Error updating package:", error)
    throw error
  }
}

// Delete a package
export async function deletePackage(packageId: string) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const packageRef = doc(db!, "packages", packageId)
    await deleteDoc(packageRef)

    return { id: packageId }
  } catch (error) {
    console.error("Error deleting package:", error)
    throw error
  }
}

// Create or update user profile
export async function updateUserProfile(userId: string, profileData: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string; state: string; country: string; dateOfBirth: string; gender: string; passportNumber: string; passportExpiry: string; emergencyContact: { name: string; relationship: string; phone: string }; preferences: { emailNotifications: boolean; smsNotifications: boolean; marketingEmails: boolean; language: string } }) {
  if (!userId) throw new Error("updateUserProfile: userId is undefined or null")
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const userRef = doc(db!, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return { id: userId }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Get all users (for admin)
export async function getAllUsers() {
  try {
    if (!checkDb()) return []

    const usersRef = collection(db!, "users")
    const querySnapshot = await getDocs(usersRef)

    const users: any[] = []
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Get all agencies (for admin)
export async function getAllAgencies() {
  try {
    if (!checkDb()) return []

    const agenciesRef = collection(db!, "agencies")
    const querySnapshot = await getDocs(agenciesRef)

    const agencies: { id: string }[] = []
    querySnapshot.forEach((doc) => {
      agencies.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return agencies
  } catch (error) {
    console.error("Error fetching agencies:", error)
    return []
  }
}

// Get agency by ID
export async function getAgencyById(agencyId: string) {
  try {
    const agencyDoc = await getDoc(doc(db!, "users", agencyId))
    if (!agencyDoc.exists()) {
      return null
    }
    return { id: agencyDoc.id, ...agencyDoc.data() }
  } catch (error) {
    console.error("Error getting agency by ID:", error)
    return null
  }
}

// Create or update agency
export async function updateAgency(agencyId: string, agencyData: any) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const agencyRef = doc(db!, "agencies", agencyId)
    const agencySnap = await getDoc(agencyRef)

    if (agencySnap.exists()) {
      // Update existing agency
      await updateDoc(agencyRef, {
        ...agencyData,
        updatedAt: serverTimestamp(),
      })
    } else {
      // Create new agency
      await updateDoc(agencyRef, {
        ...agencyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return { id: agencyId }
  } catch (error) {
    console.error("Error updating agency:", error)
    throw error
  }
}

// Record a payment
export async function recordPayment(paymentData: { status: any; bookingId: string }) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const paymentsRef = collection(db!, "payments")
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      status: paymentData.status || "pending",
      createdAt: serverTimestamp(),
    })

    // If booking ID is provided, update the booking payment status
    if (paymentData.bookingId) {
      const bookingRef = doc(db!, "bookings", paymentData.bookingId)
      await updateDoc(bookingRef, {
        paymentStatus: paymentData.status || "pending",
        updatedAt: serverTimestamp(),
      })
    }

    return { id: docRef.id }
  } catch (error) {
    console.error("Error recording payment:", error)
    throw error
  }
}

// Get user payments
export async function getUserPayments(userId: unknown) {
  try {
    if (!checkDb()) return []

    const paymentsRef = collection(db!, "payments")
    const q = query(paymentsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const payments: { id: string }[] = []
    querySnapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return payments
  } catch (error) {
    console.error("Error fetching user payments:", error)
    return []
  }
}

// Get all payments (for admin)
export async function getAllPayments() {
  try {
    if (!checkDb()) return []

    const paymentsRef = collection(db!, "payments")
    const q = query(paymentsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const payments: { id: string }[] = []
    querySnapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return payments
  } catch (error) {
    console.error("Error fetching payments:", error)
    return []
  }
}

// Get all pilgrims (users with pilgrim role)
export async function getAllPilgrims() {
  try {
    if (!checkDb()) return []

    const usersRef = collection(db!, "users")
    const q = query(usersRef, where("userType", "==", "pilgrim"))
    const querySnapshot = await getDocs(q)

    const pilgrims: {
      // Ensure status field exists
      status: any
      // Ensure createdAt is properly formatted
      createdAt: any; id: string
    }[] = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      pilgrims.push({
        id: doc.id,
        ...userData,
        // Ensure status field exists
        status: userData.status || "active",
        // Ensure createdAt is properly formatted
        createdAt: userData.createdAt || userData.dateJoined || null,
      })
    })

    return pilgrims
  } catch (error) {
    console.error("Error fetching pilgrims:", error)

    // If it's a missing index error, try without the where clause and filter manually
    if (
      typeof error === "object" &&
      error !== null &&
      ("code" in error || "message" in error)
    ) {
      const err = error as { code?: string; message?: string }
      if (
        err.code === "failed-precondition" ||
        (typeof err.message === "string" && err.message.includes("index"))
      ) {
        console.warn("Firestore index not available, fetching all users and filtering")
        try {
          const allUsers = await getAllUsers()
          return allUsers.filter((user) => user.userType === "pilgrim" || user.role === "pilgrim")
        } catch (fallbackError) {
          console.error("Fallback query also failed:", fallbackError)
          return []
        }
      }
    }

    return []
  }
}

// Update user onboarding data
export async function updateUserOnboardingData(userId: string, onboardingData: { fullName?: string; department?: string; position?: string; phoneNumber: string; adminRole?: string; role?: string; onboardingCompleted: boolean; agencyName?: string; managerName?: string; countryOfOperation?: string; cityOfOperation?: string; alternativeEmail?: string; averagePilgrimsPerYear?: number; servicesOffered?: { ticketing: boolean; visaProcessing: boolean; accommodation: boolean; feeding: boolean; localTransportation: boolean; touristGuide: boolean }; passportNumber?: string; countryOfResidence?: string; cityOfResidence?: string; age?: number; gender?: "female" | "male" | "other"; nextOfKin?: string; nextOfKinPhone?: string; nextOfKinEmail?: string; averageUmrahVisits?: number; numberOfCoPilgrims?: number }) {
  try {
    if (!checkDb()) throw new Error("Firestore not initialized")

    const userRef = doc(db!, "users", userId)
    await updateDoc(userRef, {
      ...onboardingData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    })

    return { id: userId, success: true }
  } catch (error) {
    console.error("Error updating user onboarding data:", error)
    throw error
  }
}

// Get booking by ID
export async function getBookingById(bookingId: string) {
  try {
    if (!checkDb()) return null

    const bookingRef = doc(db!, "bookings", bookingId)
    const bookingSnap = await getDoc(bookingRef)

    if (bookingSnap.exists()) {
      return { id: bookingSnap.id, ...bookingSnap.data() }
    } else {
      console.log("No booking found with ID:", bookingId)
      return null
    }
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: any) {
  const bookingRef = doc(db!, "bookings", bookingId)
  await updateDoc(bookingRef, { status })
}

// Get bookings by package ID
export async function getBookingsByPackageId(packageId: string) {
  try {
    const bookingsRef = collection(db, "bookings")
    const q = query(bookingsRef, where("packageId", "==", packageId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}
