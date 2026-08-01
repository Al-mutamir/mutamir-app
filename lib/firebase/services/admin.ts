import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "../config";

import type { Booking } from "../interface/booking";
import type { AdminStats } from "../interface/admin";
import type { Payment } from "../interface/payment";

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Users
    const usersSnapshot = await getDocs(collection(db!, "users"));
    const totalUsers = usersSnapshot.size;

    // Compute user stats by role
    const userCounts = { pilgrims: 0, agencies: 0, admins: 0 };
    usersSnapshot.docs.forEach((d) => {
      const data: any = d.data();
      const role = data?.role;
      if (role === "pilgrim") userCounts.pilgrims += 1;
      else if (role === "agency") userCounts.agencies += 1;
      else if (role === "admin") userCounts.admins += 1;
    });

    const userStats = {
      pilgrims: userCounts.pilgrims,
      agencies: userCounts.agencies,
      admins: userCounts.admins,
      total: totalUsers,
    };

    // Agencies (stored as users with role === "agency")
    const agenciesSnapshot = await getDocs(
      query(collection(db!, "users"), where("role", "==", "agency"))
    );
    const totalAgencies = agenciesSnapshot.size;

    // Packages
    const packagesSnapshot = await getDocs(collection(db!, "packages"));
    const totalPackages = packagesSnapshot.size;

    // Bookings
    const bookingsRef = collection(db!, "bookings");
    const allBookingsSnapshot = await getDocs(bookingsRef);
    const totalBookings = allBookingsSnapshot.size;

    // Bookings by status
    const bookingCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    allBookingsSnapshot.docs.forEach((doc) => {
      const b: any = doc.data();
      const status = b?.status;
      if (status === "pending") bookingCounts.pending += 1;
      else if (status === "confirmed") bookingCounts.confirmed += 1;
      else if (status === "completed") bookingCounts.completed += 1;
      else if (status === "cancelled") bookingCounts.cancelled += 1;
    });

    const bookingsByStatus = bookingCounts;

    const recentBookingsSnapshot = await getDocs(
      query(bookingsRef, orderBy("createdAt", "desc"), limit(10))
    );

    const recentBookings: Booking[] = recentBookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));

    // Payments: summarize statuses and compute revenue/time-based aggregates and top agencies
    const paymentsSnapshot = await getDocs(collection(db!, "payments"));

    let totalRevenue = 0;
    let monthly = 0;
    let weekly = 0;
    let daily = 0;

    const paymentCounts: any = { pending: 0, paid: 0, failed: 0, refunded: 0 };
    const agencySums: Record<string, { revenue: number; bookings: number }> = {};

    const now = new Date();
    const msDay = 24 * 60 * 60 * 1000;

    function toDate(value: any): Date | null {
      if (!value) return null;
      try {
        if (typeof value === "object" && typeof value.toDate === "function") {
          return value.toDate();
        }
        if (typeof value === "number") return new Date(value);
        if (typeof value === "string") return new Date(value);
      } catch (e) {
        return null;
      }
      return null;
    }

    paymentsSnapshot.docs.forEach((doc) => {
      const p = doc.data() as any;
      const status = p?.status;
      if (status && paymentCounts[status] !== undefined) paymentCounts[status] += 1;

      if (status === "paid") {
        const amount = typeof p.amount === "number" ? p.amount : Number(p.amount) || 0;
        totalRevenue += amount;

        const created = toDate(p.createdAt);
        if (created) {
          const diff = now.getTime() - created.getTime();
          if (diff <= msDay) daily += amount;
          if (diff <= 7 * msDay) weekly += amount;
          if (diff <= 30 * msDay) monthly += amount;
        }

        const agencyId = p?.agencyId;
        if (agencyId) {
          if (!agencySums[agencyId]) agencySums[agencyId] = { revenue: 0, bookings: 0 };
          agencySums[agencyId].revenue += amount;
          agencySums[agencyId].bookings += 1;
        }
      }
    });

    // Top agencies by revenue (take top 10)
    const topAgencies = Object.keys(agencySums)
      .map((id) => ({ agencyId: id, revenue: agencySums[id].revenue, bookings: agencySums[id].bookings }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const revenue: any = { total: totalRevenue, monthly, weekly, daily };

    const paymentsByStatus = {
      pending: paymentCounts.pending,
      paid: paymentCounts.paid,
      failed: paymentCounts.failed,
      refunded: paymentCounts.refunded,
    };

    return {
      totalUsers,
      totalAgencies,
      totalPackages,
      totalBookings,
      totalRevenue,
      recentBookings,

      users: usersSnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),
      agencies: agenciesSnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),
      packages: packagesSnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),
      payments: paymentsSnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),

      bookingsByStatus,
      revenue,
      paymentsByStatus,
      topAgencies,
      userStats,
    };
  } catch (error) {
    console.error("Error getting admin statistics:", error);

    return {
      totalUsers: 0,
      totalAgencies: 0,
      totalPackages: 0,
      totalBookings: 0,
      totalRevenue: 0,
      recentBookings: [],
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Re-exports and admin helpers (convenience layer)                          */
/* -------------------------------------------------------------------------- */

// Re-export commonly-used service functions so admin pages can import from the single admin module
export { getAllPayments, getPaymentById, getPaymentsByPilgrim, getPaymentsByAgency, getPaymentsByBooking, createPayment, updatePayment, updatePaymentStatus } from "./payment"
export { getAllBookings, getBookingById, createBooking, updateBooking, updateBookingStatus, updateBookingPayment, getBookingsByAgency, getBookingsByPilgrim, getBookingsByPackage } from "./booking"
export { getAllPackages, getAllPackages as getPackages, getPackageById, createPackage, updatePackage, publishPackage, archivePackage, deletePackage, getPackagesByAgency, getPublishedPackages } from "./package"
export { getAllAgencies, getAgencyById, updateAgency, getAgencyStats } from "./agency"
export { getAllUsers, getUserById, getUserByEmail, getUsersByRole, getPilgrims, getAgencies, updateUserRole, getAdmins } from "./user"

import { addDoc, setDoc, deleteDoc, doc as _doc, getDoc as _getDoc } from "firebase/firestore"
import { db as _db } from "../config"

/**
 * Create an agency document (admin helper).
 * This creates a Firestore user document with role="agency" and returns the new document id.
 */
export async function createAgency(data: any): Promise<string> {
  if (!_db) throw new Error("Firestore not initialized")
  const payload = { ...data, role: "agency", createdAt: new Date(), updatedAt: new Date() }
  const ref = await addDoc(collection(_db, "users"), payload)
  return ref.id
}

/**
 * Delete an agency (remove user document). Use with caution.
 */
export async function deleteAgency(agencyId: string): Promise<void> {
  if (!_db) throw new Error("Firestore not initialized")
  await deleteDoc(_doc(_db, "users", agencyId))
}

/**
 * Create a user document (admin helper).
 * NOTE: This only creates the Firestore user document — it does not create a Firebase Auth account.
 * For production you should create the Auth user server-side and set the Firestore document id to the UID.
 */
export async function createUser(email: string, password: string, role: string, displayName?: string, extras: any = {}): Promise<string> {
  if (!_db) throw new Error("Firestore not initialized")
  const payload = {
    email,
    displayName: displayName || "",
    role: role || "pilgrim",
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...extras,
  }
  const ref = await addDoc(collection(_db, "users"), payload)
  return ref.id
}

/**
 * Create admin user (shortcut wrapper) — creates Firestore document with role=admin.
 * See note on createUser about actual Auth creation.
 */
export async function createAdminUser(email: string, password: string, displayName?: string, extras: any = {}): Promise<string> {
  return createUser(email, password, "admin", displayName, extras)
}

/**
 * Delete user document
 */
export async function deleteUser(userId: string): Promise<void> {
  if (!_db) throw new Error("Firestore not initialized")
  await deleteDoc(_doc(_db, "users", userId))
}

/**
 * Confirm a payment: mark as paid and optionally update related booking payment info.
 */
import { updatePaymentStatus as _updatePaymentStatus } from "./payment"
import { updateBookingPayment as _updateBookingPayment } from "./booking"

export async function confirmPayment(paymentId: string, opts?: { bookingId?: string; reference?: string }) {
  // mark payment as paid
  await _updatePaymentStatus(paymentId, "paid")

  // if bookingId provided, update booking payment fields
  if (opts?.bookingId) {
    await _updateBookingPayment(opts.bookingId, {
      paymentStatus: "paid",
      paymentReference: opts.reference,
      paymentMethod: "manual",
    })
  }
}

/**
 * Agency verification helper (alias to verifyAgency/updateAgency)
 */
import { verifyAgency as _verifyAgency } from "./user"
export async function updateAgencyVerification(agencyId: string): Promise<void> {
  return _verifyAgency(agencyId)
}

/**
 * Admin settings stored in a single document: collection `settings`, doc `admin`.
 */
import { getDoc, doc as docRef } from "firebase/firestore"

export async function getAdminSettings(): Promise<any> {
  if (!_db) throw new Error("Firestore not initialized")
  try {
    const ref = docRef(_db, "settings", "admin")
    const snap = await getDoc(ref)
    if (!snap.exists()) return {}
    return snap.data()
  } catch (err) {
    console.error("Error fetching admin settings:", err)
    return {}
  }
}

export async function updateAdminSettings(settings: any): Promise<void> {
  if (!_db) throw new Error("Firestore not initialized")
  try {
    const ref = docRef(_db, "settings", "admin")
    await setDoc(ref, { ...settings, updatedAt: new Date() }, { merge: true })
  } catch (err) {
    console.error("Error updating admin settings:", err)
    throw err
  }
}
