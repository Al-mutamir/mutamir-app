// Delete a booking by ID
export const deleteBooking = async (bookingId: string) => {
  try {
    await deleteDoc(doc(db!, "bookings", bookingId));
    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};
// Update booking with arbitrary fields (for admin edit)
export const updateBooking = async (bookingId: string, updates: Partial<any>) => {
  try {
    await updateDoc(doc(db!, "bookings", bookingId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};
// Update booking status and amount paid
export const updateBookingStatusAndAmount = async (bookingId: string, status: string, amountPaid: number) => {
  try {
    await updateDoc(doc(db!, "bookings", bookingId), {
      status,
      amountPaid,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating booking status/amount:", error)
    throw error
  }
}
import { db } from "@/lib/firebase/config"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
} from "firebase/firestore"
import { sendWebhook } from "@/lib/webhooks"
import { Package } from "@/firebase/firestore"

// Update the getAdminStats function to provide more comprehensive data
export const getAdminStats = async () => {
  try {
    // Get counts from collections
    const [usersSnapshot, agenciesSnapshot, pilgrimsSnapshot, packagesSnapshot, bookingsSnapshot, paymentsSnapshot] =
      await Promise.all([
        getDocs(collection(db!, "users")),
        getDocs(query(collection(db!, "users"), where("role", "==", "agency"))),
        getDocs(query(collection(db!, "users"), where("role", "==", "pilgrim"))),
        getDocs(collection(db!, "packages")),
        getDocs(collection(db!, "bookings")),
        getDocs(collection(db!, "payments")),
      ])

    // Get verified agencies
    const verifiedAgenciesSnapshot = await getDocs(
      query(collection(db!, "users"), where("role", "==", "agency"), where("verified", "==", true)),
    )

    // Get pending verifications
    const pendingVerificationsSnapshot = await getDocs(
      query(collection(db!, "users"), where("role", "==", "agency"), where("verified", "==", false)),
    )

    // Calculate total revenue
    let totalRevenue = 0
    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data()
      if (payment.status === "confirmed") {
        totalRevenue += payment.amount || 0
      }
    })

    // Get recent bookings
    const recentBookingsSnapshot = await getDocs(
      query(collection(db!, "bookings"), orderBy("createdAt", "desc"), limit(5)),
    )
    const recentBookings = recentBookingsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        createdAt: data.createdAt ?? null,
        totalPrice: data.totalPrice ?? 0,
        paymentStatus: data.paymentStatus ?? "unpaid",
      }
    })

    // Get monthly user growth data
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const userGrowthSnapshot = await getDocs(
      query(collection(db!, "users"), where("createdAt", ">=", sixMonthsAgo), orderBy("createdAt", "asc")),
    )

    // Group users by month
    const usersByMonth: Record<string, number> = {}
    const pilgrimsByMonth: Record<string, number> = {}
    const agenciesByMonth: Record<string, number> = {}

    userGrowthSnapshot.forEach((doc) => {
      const userData = doc.data()
      const createdAt = userData.createdAt?.toDate() || new Date()
      const monthYear = `${createdAt.getMonth()}-${createdAt.getFullYear()}`

      usersByMonth[monthYear] = (usersByMonth[monthYear] || 0) + 1

      if (userData.role === "pilgrim") {
        pilgrimsByMonth[monthYear] = (pilgrimsByMonth[monthYear] || 0) + 1
      } else if (userData.role === "agency") {
        agenciesByMonth[monthYear] = (agenciesByMonth[monthYear] || 0) + 1
      }
    })

    // Get monthly revenue data
    const revenueSnapshot = await getDocs(
      query(collection(db!, "payments"), where("date", ">=", sixMonthsAgo), orderBy("date", "asc")),
    )

    // Group revenue and bookings by month
    const revenueByMonth: Record<string, number> = {}
    const bookingsByMonth: Record<string, number> = {}
    revenueSnapshot.forEach((doc) => {
      const payment = doc.data()
      const paymentDate = payment.date?.toDate() || new Date()
      const monthYear = `${paymentDate.getMonth()}-${paymentDate.getFullYear()}`

      if (payment.status === "confirmed") {
        revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + (payment.amount || 0)
      }
    })

    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data()
      const bookingDate = booking.createdAt?.toDate() || new Date()
      const monthYear = `${bookingDate.getMonth()}-${bookingDate.getFullYear()}`

      bookingsByMonth[monthYear] = (bookingsByMonth[monthYear] || 0) + 1
    })

    // Package types, booking statuses, payment methods
    const packageTypes: Record<string, number> = {
      Hajj: 0,
      Umrah: 0,
      Other: 0,
    }
    const bookingStatuses: Record<string, number> = {}
    const paymentMethods: Record<string, number> = {}
    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data()
      const status = booking.status || "pending"
      bookingStatuses[status] = (bookingStatuses[status] || 0) + 1
    })

    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data()
      const method = payment.method || "Card Payment"
      paymentMethods[method] = (paymentMethods[method] || 0) + 1
    })

    return {
      totalUsers: usersSnapshot.size,
      totalAgencies: agenciesSnapshot.size,
      verifiedAgencies: verifiedAgenciesSnapshot.size,
      totalPilgrims: pilgrimsSnapshot.size,
      totalPackages: packagesSnapshot.size,
      totalBookings: bookingsSnapshot.size,
      totalRevenue,
      recentBookings,
      pendingVerifications: pendingVerificationsSnapshot.size,
      monthlySummary: {
        userGrowth: {
          total: usersByMonth,
          pilgrims: pilgrimsByMonth,
          agencies: agenciesByMonth,
        },
        revenue: revenueByMonth,
        bookings: bookingsByMonth,
      },
      distributions: {
        packageTypes,
        bookingStatuses,
        paymentMethods,
      },
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    throw error
  }
}

// Get all packages
export const getAllPackages = async () => {
  try {
    const packagesSnapshot = await getDocs(collection(db!, "packages"))
    return packagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting all packages:", error)
    throw error
  }
}

// import type { Package } from "@/app/dashboard/admin/packages/edit/[id]/page" // adjust path if needed

export const getPackageById = async (packageId: string | string[]): Promise<Package | null> => {
  try {
    const id = Array.isArray(packageId) ? packageId[0] : packageId
    const packageDoc = await getDoc(doc(db!, "packages", id))
    if (!packageDoc.exists()) {
      return null
    }
    return {
      id: packageDoc.id,
      ...packageDoc.data(),
    } as Package
  } catch (error) {
    console.error("Error getting package by ID:", error)
    throw error
  }
}

// Create a new package
export const createPackage = async (packageData: { inclusions?: string | string[]; exclusions?: string | string[]; status?: string; title?: string; description?: string; price?: number; duration?: number; agencyId: any; agencyName: any; groupSize?: number | null; type?: string; accommodationType?: string; transportation?: string; meals?: string; itinerary?: string | { title: string; description: string }[]; startDate?: Date; endDate?: Date; createdAt?: Date; createdBy?: string; isAdminPackage?: any; location?: string }) => {
  try {
    // If this is an agency package, ensure we're using the agency name, not handler name
    if (packageData.agencyId && !packageData.isAdminPackage) {
      // Try to get the agency details to ensure we have the correct agency name
      try {
        const agencyDoc = await getDoc(doc(db!, "users", packageData.agencyId))
        if (agencyDoc.exists()) {
          const agencyData = agencyDoc.data()
          packageData.agencyName =
            agencyData.agencyName ||
            agencyData.displayName ||
            agencyData.name ||
            agencyData.email ||
            packageData.agencyName ||
            "Unknown Agency"
        }
      } catch (error) {
        console.error("Error fetching agency details for package creation:", error)
        // Continue with existing agency name if fetch fails
      }
    }

    const packageRef = await addDoc(collection(db!, "packages"), {
      ...packageData,
      createdAt: serverTimestamp(),
    })
    return packageRef.id
  } catch (error) {
    console.error("Error creating package:", error)
    throw error
  }
}

// Update a package
export const updatePackage = async (packageId: string | string[], packageData: { status: any; price?: number; groupSize?: number | null; duration?: number; updatedAt?: Date; updatedBy?: string; title?: string; description?: string; startDate?: Date; endDate?: Date; location?: string; inclusions?: string; exclusions?: string; itinerary?: string; agencyId?: string; agencyName?: string; isAdminPackage?: boolean }) => {
  try {
    const id = Array.isArray(packageId) ? packageId[0] : packageId
    await updateDoc(doc(db!, "packages", id), {
      ...packageData,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating package:", error)
    throw error
  }
}

// Delete a package
export const deletePackage = async (packageId: string) => {
  try {
    await deleteDoc(doc(db!, "packages", packageId))
    return true
  } catch (error) {
    console.error("Error deleting package:", error)
    throw error
  }
}

// Get all agencies - renamed from getAllAgencies to getAgencies to match the import
export const getAgencies = async () => {
  try {
    const agenciesSnapshot = await getDocs(query(collection(db!, "users"), where("role", "==", "agency")))
    return agenciesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        uid: doc.id,
        agencyName: data.agencyName ?? "",
        displayName: data.displayName ?? "",
        name: data.name ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        cityOfOperation: data.cityOfOperation ?? "",
        countryOfOperation: data.countryOfOperation ?? "",
        verified: data.verified ?? false,
        createdAt: data.createdAt ?? null,
        // Add any other fields you want to expose here
      }
    })
  } catch (error) {
    console.error("Error getting all agencies:", error)
    throw error
  }
}

// Also export as getAllAgencies for backward compatibility
export const getAllAgencies = async () => {
  return getAgencies()
}

// Get agency by ID
export const getAgencyById = async (agencyId: string) => {
  try {
    const agencyDoc = await getDoc(doc(db!, "users", agencyId))
    if (!agencyDoc.exists()) {
      return null
    }
    return {
      id: agencyDoc.id,
      ...agencyDoc.data(),
    }
  } catch (error) {
    console.error("Error getting agency by ID:", error)
    throw error
  }
}

// Delete an agency
export const deleteAgency = async (agencyId: string) => {
  try {
    // 1. Mark all packages by this agency as inactive
    const packagesSnapshot = await getDocs(query(collection(db!, "packages"), where("agencyId", "==", agencyId)))
    const batch = (await import("firebase/firestore")).writeBatch(db!)
    packagesSnapshot.forEach((pkgDoc) => {
      batch.update(pkgDoc.ref, { status: "archived" })
    })
    await batch.commit()

    // 2. Handle existing bookings with this agency (e.g., mark as cancelled)
    const bookingsSnapshot = await getDocs(query(collection(db!, "bookings"), where("agencyId", "==", agencyId)))
    const batch2 = (await import("firebase/firestore")).writeBatch(db!)
    bookingsSnapshot.forEach((bookingDoc) => {
      batch2.update(bookingDoc.ref, { status: "cancelled" })
    })
    await batch2.commit()

    // Delete agency from users collection
    await deleteDoc(doc(db!, "users", agencyId))

    // Send webhook notification
    // Replace 'AGENCY_WEBHOOK_URL' with your actual webhook URL variable or string
    await sendWebhook(
      process.env.AGENCY_WEBHOOK_URL || "https://discordapp.com/api/webhooks/1385617312555597875/9rw-TGN5eRDaMGJn5oLLlgcTj2hAS0ByaezXkCYmSC5a7WeDvSWGJamzXVhZ_prBLN2a", // Provide the webhook URL here
      {
        content: `**Agency Deleted**`,
        embeds: [
          {
            title: "Agency Deleted",
            description: `An agency has been deleted by admin.`,
            color: 0xff0000,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    )

    return true
  } catch (error) {
    console.error("Error deleting agency:", error)
    throw error
  }
}

// Verify or unverify an agency
export const updateAgencyVerification = async (agencyId: string, isVerified: boolean) => {
  try {
    await updateDoc(doc(db!, "users", agencyId), {
      verified: isVerified,
      verifiedAt: isVerified ? serverTimestamp() : null,
    })

    return true
  } catch (error) {
    console.error("Error updating agency verification:", error)
    throw error
  }
}

// Get all bookings
export const getAllBookings = async () => {
  try {
    const bookingsSnapshot = await getDocs(collection(db!, "bookings"))
    return bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting all bookings:", error)
    throw error
  }
}

// Get booking by ID
export const getBookingById = async (bookingId: string) => {
  try {
    const bookingDoc = await getDoc(doc(db!, "bookings", bookingId))
    if (!bookingDoc.exists()) {
      return null
    }
    return {
      id: bookingDoc.id,
      ...bookingDoc.data(),
    }
  } catch (error) {
    console.error("Error getting booking by ID:", error)
    throw error
  }
}

// Update booking payment status
export const updateBookingPaymentStatus = async (bookingId: string, paymentStatus: string, paymentReference: string | null | undefined = null) => {
  try {
    const updateData: Record<string, any> = {
      paymentStatus,
      updatedAt: serverTimestamp(),
    }

    if (paymentReference) {
      updateData.paymentReference = paymentReference
    }

    await updateDoc(doc(db!, "bookings", bookingId), updateData)

    return true
  } catch (error) {
    console.error("Error updating booking payment status:", error)
    throw error
  }
}

// Create a new agency
export const createAgency = async (agencyData: { agencyName: string; email: string; password: string; phoneNumber: string; description: string; website: string; address: string; cityOfOperation: string; stateOfOperation: string; countryOfOperation: string; yearsInOperation: string; servicesOffered: never[]; pilgrimsServed: string; verified: boolean; role: string; createdAt: Date; onboardingCompleted: boolean }) => {
  try {
    // Create user document in Firestore
    const agencyRef = await addDoc(collection(db!, "users"), {
      ...agencyData,
      role: "agency",
      verified: false,
      createdAt: serverTimestamp(),
    })

    return agencyRef.id
  } catch (error) {
    console.error("Error creating agency:", error)
    throw error
  }
}

// Get all pilgrims
export const getAllPilgrims = async () => {
  try {
    const pilgrimsSnapshot = await getDocs(query(collection(db!, "users"), where("role", "==", "pilgrim")))
    return pilgrimsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting all pilgrims:", error)
    throw error
  }
}

// Get pilgrim by ID
export const getPilgrimById = async (pilgrimId: string) => {
  try {
    const pilgrimDoc = await getDoc(doc(db!, "users", pilgrimId))
    if (!pilgrimDoc.exists()) {
      return null
    }
    return {
      id: pilgrimDoc.id,
      ...pilgrimDoc.data(),
    }
  } catch (error) {
    console.error("Error getting pilgrim by ID:", error)
    throw error
  }
}

// Get all payments
export const getAllPayments = async () => {
  try {
    const paymentsSnapshot = await getDocs(collection(db!, "payments"))
    return paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting all payments:", error)
    throw error
  }
}

// Confirm a payment
export const confirmPayment = async (paymentId: string | null | undefined, bookingId: string) => {
  try {
    if (!paymentId || typeof paymentId !== "string") {
      throw new Error("Invalid paymentId")
    }
    if (!bookingId || typeof bookingId !== "string") {
      throw new Error("Invalid bookingId")
    }
    // Update payment status
    await updateDoc(doc(db!, "payments", paymentId), {
      status: "confirmed",
      confirmedAt: serverTimestamp(),
    })

    // Update booking payment status
    await updateBookingPaymentStatus(bookingId, "paid", paymentId)

    return true
  } catch (error) {
    console.error("Error confirming payment:", error)
    throw error
  }
}

// Get admin dashboard chart data
export const getAdminChartData = async (timeRange = "monthly") => {
  try {
    // Implementation would depend on how you want to structure your data
    // This is a placeholder that would be replaced with actual implementation
    return {
      userGrowth: [],
      revenue: [],
      bookings: [],
    }
  } catch (error) {
    console.error("Error getting admin chart data:", error)
    throw error
  }
}

// Update admin settings
export const updateAdminSettings = async (settings: { siteName: string; siteDescription: string; contactEmail: string; contactPhone: string; enableAgencyRegistration: boolean; enablePublicPackages: boolean; maintenanceMode: boolean; discordWebhookUrl: string; paymentGateway: string; paystackPublicKey: string; paystackSecretKey: string; adminEmail: string; supportEmail: string; logoUrl: string; faviconUrl: string; primaryColor: string; secondaryColor: string; termsUrl: string; privacyUrl: string; refundUrl: string }) => {
  try {
    const settingsRef = doc(db!, "settings", "admin")
    const settingsDoc = await getDoc(settingsRef)

    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(settingsRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return true
  } catch (error) {
    console.error("Error updating admin settings:", error)
    throw error
  }
}

// Get admin settings
export const getAdminSettings = async () => {
  try {
    const settingsRef = doc(db!, "settings", "admin")
    const settingsDoc = await getDoc(settingsRef)

    if (settingsDoc.exists()) {
      return settingsDoc.data()
    }

    // For settings object in getAdminSettings fallback
    const defaultSettings: Record<string, any> = {
      siteName: "Al-Mutamir",
      siteDescription: "Hajj and Umrah Services",
      contactEmail: "admin@almutamir.com",
      contactPhone: "+234 800 123 4567",
      enableAgencyRegistration: true,
      enablePublicPackages: true,
      maintenanceMode: false,
    }

    return defaultSettings
  } catch (error) {
    console.error("Error getting admin settings:", error)
    throw error
  }
}

// Add a function to get pilgrim dashboard stats
export const getPilgrimStats = async (userId: unknown) => {
  try {
    // Get pilgrim's bookings
    const bookingsSnapshot = await getDocs(query(collection(db!, "bookings"), where("pilgrimId", "==", userId)))

    const bookings = bookingsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        departureDate: data.departureDate,
        status: data.status, // Ensure status is included
      }
    })

    // Get pilgrim's payments
    const paymentsSnapshot = await getDocs(query(collection(db!, "payments"), where("pilgrimId", "==", userId)))

    const payments = paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; status?: string; amount?: number; [key: string]: any }>

    // Calculate total amount paid
    const totalPaid = payments.reduce((sum, payment) => {
      if (payment.status === "confirmed") {
        return sum + (payment.amount || 0)
      }
      return sum
    }, 0)

    // Get upcoming bookings (future departure date)
    const now = new Date()
    const upcomingBookings = bookings.filter((booking) => {
      const departureDate = booking.departureDate?.toDate() || new Date(booking.departureDate)
      return departureDate > now && booking.status !== "cancelled"
    })

    // Get completed bookings (past departure date)
    const completedBookings = bookings.filter((booking) => {
      const departureDate = booking.departureDate?.toDate() || new Date(booking.departureDate)
      return departureDate <= now && booking.status !== "cancelled"
    })

    // Get cancelled bookings
    const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

    // Get recent activity (bookings and payments, sorted by date)
    const recentActivity: Array<{
      type: string
      date: Date
      data: any
    }> = [
      ...bookings.map((booking: any) => ({
        type: "booking",
        date: booking.createdAt?.toDate() || new Date(),
        data: booking,
      })),
      ...payments.map((payment: any) => ({
        type: "payment",
        date: payment.date?.toDate() || new Date(),
        data: payment,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)

    return {
      totalBookings: bookings.length,
      totalPaid,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      recentActivity,
      bookings,
      payments,
    }
  } catch (error) {
    console.error("Error getting pilgrim stats:", error)
    throw error
  }
}

// Add a function to get agency dashboard stats
export const getAgencyStats = async (agencyId: unknown) => {
  try {
    // Get agency's packages
    const packagesSnapshot = await getDocs(query(collection(db!, "packages"), where("agencyId", "==", agencyId)))

    const packages = packagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { status?: string; [key: string]: any }),
    }))

    // Get agency's bookings
    const bookingsSnapshot = await getDocs(query(collection(db!, "bookings"), where("agencyId", "==", agencyId)))

    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; status?: string; totalPrice?: number; travelDate?: any; createdAt?: any; packageId?: string; [key: string]: any }>

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

    // Get confirmed revenue (from confirmed or completed bookings)
    const confirmedRevenue = bookings
      .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

    // Count bookings by status
    const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length
    const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
    const completedBookings = bookings.filter((booking) => booking.status === "completed").length
    const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled").length

    // Count packages by status
    const activePackages = packages.filter((pkg) => pkg.status === "active").length
    const draftPackages = packages.filter((pkg) => pkg.status === "draft").length

    // Get upcoming bookings (future departure date)
    const now = new Date()
    const upcomingBookings = bookings
      .filter((booking) => {
        const travelDate = booking.travelDate?.toDate() || new Date(booking.travelDate)
        return travelDate > now && booking.status !== "cancelled"
      })
      .sort((a, b) => {
        const dateA = a.travelDate?.toDate() || new Date(a.travelDate)
        const dateB = b.travelDate?.toDate() || new Date(b.travelDate)
        return dateA - dateB
      })
      .slice(0, 5)

    // Get recent bookings
    const recentBookings = [...bookings]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date()
        const dateB = b.createdAt?.toDate() || new Date()
        return dateB - dateA
      })
      .slice(0, 5)

    // For packagePerformance in getAgencyStats
    const packagePerformance: Array<any> = packages
      .map((pkg: any) => {
        const packageBookings = bookings.filter((b: any) => b.packageId === pkg.id)
        const bookingCount = packageBookings.length
        const maxCapacity = pkg.groupSize || 20
        const fillPercentage = Math.min(Math.round((bookingCount / maxCapacity) * 100), 100)

        return {
          ...pkg,
          bookingCount,
          fillPercentage,
          spotsLeft: maxCapacity - bookingCount,
        }
      })
      .sort((a, b) => b.bookingCount - a.bookingCount)

    return {
      totalBookings: bookings.length,
      confirmedBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      confirmedRevenue,
      totalPackages: packages.length,
      activePackages,
      draftPackages,
      upcomingBookings,
      recentBookings,
      packagePerformance,
      packages,
      bookings,
    }
  } catch (error) {
    console.error("Error getting agency stats:", error)
    throw error
  }
}

// Get packages (alias for getAllPackages)
export const getPackages = async () => {
  return getAllPackages()
}

// Get all users (already exists but ensure it's exported)
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db!, "users"))
    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

// Delete a user
export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db!, "users", userId))
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Update user role
export const updateUserRole = async (userId: string, role: string) => {
  try {
    await updateDoc(doc(db!, "users", userId), {
      role: role,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// Create admin user
export const createAdminUser = async (email: string, password: string, displayName: string, userData: Record<string, any>) => {
  try {
    const userRef = await addDoc(collection(db!, "users"), {
      ...userData,
      role: "admin",
      createdAt: serverTimestamp(),
    })
    return userRef.id
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw error
  }
}

// Create user
export const createUser = async (email: string, password: string, role: string | null, displayName: string, userData: Record<string, any>) => {
  try {
    const userRef = await addDoc(collection(db!, "users"), {
      ...userData,
      createdAt: serverTimestamp(),
    })
    return userRef.id
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}
