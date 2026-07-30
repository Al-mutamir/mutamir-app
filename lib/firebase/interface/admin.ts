import type { Booking } from "./booking";
import type { Package } from "./package";
import type { User } from "./user";
import type { Payment } from "./payment";
import type { Agency } from "./agency";

/**
 * Admin Dashboard Statistics
 */
export interface AdminStats {
  totalUsers: number;
  totalAgencies: number;
  totalPackages: number;
  totalBookings: number;
  totalRevenue: number;

  recentBookings: Booking[];

  users?: User[];
  agencies?: Agency[];
  packages?: Package[];
  payments?: Payment[];
}

/**
 * Agency Dashboard Statistics
 */
export interface AgencyStats {
  packages: Package[];
  activePackages: number;

  upcomingTrips: Package[];
  recentBookings: Booking[];

  clients: User[];
  totalClients: number;

  totalRevenue: number;
}

/**
 * Pilgrim Dashboard Statistics
 */
export interface PilgrimStats {
  bookings: Booking[];

  upcomingBookings: Booking[];
  completedBookings: Booking[];
  cancelledBookings: Booking[];

  totalPaid: number;

  recentActivity: ActivityItem[];
}

/**
 * Recent Activity Item
 */
export interface ActivityItem {
  type: "booking" | "payment";
  date: Date;
  data: Booking | Payment;
}

/**
 * Generic Dashboard Summary
 */
export interface DashboardSummary {
  title: string;
  value: number | string;
  change?: number;
  icon?: string;
}

/**
 * Revenue Statistics
 */
export interface RevenueStats {
  total: number;
  monthly: number;
  weekly: number;
  daily: number;
}

/**
 * Booking Statistics
 */
export interface BookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

/**
 * Package Statistics
 */
export interface PackageStats {
  active: number;
  draft: number;
  archived: number;
  total: number;
}

/**
 * User Statistics
 */
export interface UserStats {
  pilgrims: number;
  agencies: number;
  admins: number;
  total: number;
}