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

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Users
    const usersSnapshot = await getDocs(collection(db!, "users"));
    const totalUsers = usersSnapshot.size;

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

    const recentBookingsSnapshot = await getDocs(
      query(bookingsRef, orderBy("createdAt", "desc"), limit(10))
    );

    let totalRevenue = 0;

    const recentBookings: Booking[] = recentBookingsSnapshot.docs.map((doc) => {
      const booking: Booking = {
        id: doc.id,
        ...(doc.data() as Omit<Booking, "id">),
      };

      // Use the payment status defined in your Booking interface
      if (booking.paymentStatus === "paid") {
        totalRevenue += booking.totalPrice;
      }

      return booking;
    });

    return {
      totalUsers,
      totalAgencies,
      totalPackages,
      totalBookings,
      totalRevenue,
      recentBookings,
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