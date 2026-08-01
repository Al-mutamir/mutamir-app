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