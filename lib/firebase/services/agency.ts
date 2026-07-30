import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config";

import type { Agency } from "../interface/agency";
import type { AgencyStats } from "../interface/admin";
import type { Package } from "../interface/package";
import type { Booking } from "../interface/booking";
import type { User } from "../interface/user";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  return db;
}

/**
 * Get all agencies
 */
export async function getAllAgencies(): Promise<Agency[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(collection(firestore, "agencies"));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Agency, "id">),
    }));
  } catch (error) {
    console.error("Error getting agencies:", error);
    return [];
  }
}

/**
 * Get agency by ID
 */
export async function getAgencyById(
  agencyId: string
): Promise<Agency | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDoc(doc(firestore, "agencies", agencyId));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Agency, "id">),
    };
  } catch (error) {
    console.error("Error getting agency:", error);
    return null;
  }
}

/**
 * Create or update agency
 */
export async function updateAgency(
  agencyId: string,
  data: Partial<Agency>
): Promise<void> {
  try {
    const firestore = checkDb();

    const agencyRef = doc(firestore, "agencies", agencyId);
    const agencyDoc = await getDoc(agencyRef);

    if (agencyDoc.exists()) {
      await updateDoc(agencyRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(agencyRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating agency:", error);
    throw error;
  }
}

/**
 * Get agency dashboard statistics
 */
export async function getAgencyStats(
  agencyId: string
): Promise<AgencyStats> {
  try {
    const firestore = checkDb();

    // Packages
    const packagesSnapshot = await getDocs(
      query(
        collection(firestore, "packages"),
        where("agencyId", "==", agencyId)
      )
    );

    const packages: Package[] = packagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Package, "id">),
    }));

    // Bookings
    const bookingsSnapshot = await getDocs(
      query(
        collection(firestore, "bookings"),
        where("agencyId", "==", agencyId)
      )
    );

    const bookings: Booking[] = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));

    // Active packages
    const activePackages = packages.filter(
      (pkg) => pkg.status === "active"
    ).length;

    // Upcoming trips
    const now = new Date();

    const upcomingTrips = packages.filter((pkg) => {
      if (!pkg.startDate) return false;
      return new Date(pkg.startDate) > now;
    });

    // Recent bookings (latest 5)
    const recentBookings = [...bookings]
      .sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt as string).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt as string).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 5);

    // Revenue
    const totalRevenue = bookings.reduce((sum, booking) => {
      return booking.paymentStatus === "paid"
        ? sum + (booking.totalPrice ?? 0)
        : sum;
    }, 0);

    // Unique clients
    const uniqueClients = new Set(
      bookings.map((booking) => booking.pilgrimId)
    );

    // Placeholder until user service is implemented
    const clients: User[] = [];

    return {
      packages,
      activePackages,
      upcomingTrips,
      recentBookings,
      clients,
      totalClients: uniqueClients.size,
      totalRevenue,
    };
  } catch (error) {
    console.error("Error getting agency statistics:", error);

    return {
      packages: [],
      activePackages: 0,
      upcomingTrips: [],
      recentBookings: [],
      clients: [],
      totalClients: 0,
      totalRevenue: 0,
    };
  }
}