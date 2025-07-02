"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getAdminStats } from "@/lib/firebase/admin"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/ui/chart"
import { CreditCard, Package, Users, Building, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Define proper types for the booking structure
interface RecentBooking {
  id: string
  createdAt: any
  totalPrice: any
  paymentStatus: any
  userName?: string
  agencyName?: string
  packageName?: string
  status?: string
}

interface AdminStats {
  totalUsers: number
  totalPilgrims: number
  totalAgencies: number
  verifiedAgencies: number
  pendingVerifications: number
  totalBookings: number
  totalPackages: number
  totalRevenue: number
  recentBookings: RecentBooking[]
  monthlySummary: {
    userGrowth: {
      pilgrims: Record<string, number>
      agencies: Record<string, number>
    }
    revenue: Record<string, number>
    bookings: Record<string, number>
  }
  distributions: {
    packageTypes: Record<string, number>
    bookingStatuses: Record<string, number>
    paymentMethods: Record<string, number>
  }
}

const AdminDashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPilgrims: 0,
    totalAgencies: 0,
    verifiedAgencies: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalPackages: 0,
    totalRevenue: 0,
    recentBookings: [], // Now properly typed as RecentBooking[]
    monthlySummary: {
      userGrowth: {
        pilgrims: {},
        agencies: {},
      },
      revenue: {},
      bookings: {},
    },
    distributions: {
      packageTypes: {},
      bookingStatuses: {},
      paymentMethods: {},
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const adminStats = await getAdminStats()
        setStats(adminStats)
      } catch (err) {
        console.error("Error fetching admin data:", err)
        setError("Failed to load your dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const formatDate = (date: any): string => {
    if (!date) return "N/A"

    try {
      let dateObj: Date

      // Handle Firestore Timestamp
      if (date && typeof date.toDate === "function") {
        dateObj = date.toDate()
      }
      // Handle string dates
      else if (typeof date === "string") {
        dateObj = new Date(date)
      }
      // Handle Date objects
      else if (date instanceof Date) {
        dateObj = date
      }
      // Handle timestamp numbers
      else if (typeof date === "number") {
        dateObj = new Date(date)
      } else {
        return "N/A"
      }

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "N/A"
      }

      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "N/A"
    }
  }

  // Prepare chart data
  const userGrowthData = {
    labels: Object.keys(stats.monthlySummary.userGrowth.pilgrims).map((key) => {
      const [month, year] = key.split("-")
      return `${month}/${year.slice(2)}`
    }),
    datasets: [
      {
        label: "Pilgrims",
        data: Object.values(stats.monthlySummary.userGrowth.pilgrims),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Agencies",
        data: Object.values(stats.monthlySummary.userGrowth.agencies),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
      },
    ],
  }

  const revenueData = {
    labels: Object.keys(stats.monthlySummary.revenue).map((key) => {
      const [month, year] = key.split("-")
      return `${month}/${year.slice(2)}`
    }),
    datasets: [
      {
        label: "Revenue",
        data: Object.values(stats.monthlySummary.revenue),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
    ],
  }

  const packageTypeData = {
    labels: Object.keys(stats.distributions.packageTypes),
    datasets: [
      {
        label: "Package Types",
        data: Object.values(stats.distributions.packageTypes),
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)", // Green for Hajj
          "rgba(59, 130, 246, 0.6)", // Blue for Umrah
          "rgba(156, 163, 175, 0.6)", // Gray for Other
        ],
        borderColor: ["rgb(34, 197, 94)", "rgb(59, 130, 246)", "rgb(156, 163, 175)"],
        borderWidth: 1,
      },
    ],
  }

  const bookingStatusData = {
    labels: Object.keys(stats.distributions.bookingStatuses).map(
      (status) => status.charAt(0).toUpperCase() + status.slice(1),
    ),
    datasets: [
      {
        label: "Booking Statuses",
        data: Object.values(stats.distributions.bookingStatuses),
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(234, 179, 8, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: ["rgb(34, 197, 94)", "rgb(234, 179, 8)", "rgb(59, 130, 246)", "rgb(239, 68, 68)"],
        borderWidth: 1,
      },
    ],
  }

  if (loading) {
    return (
      <DashboardLayout userType="admin" title="Dashboard" description="Welcome to your admin dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="admin" title="Dashboard" description="Welcome to your admin dashboard">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-lg text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="admin" title="Dashboard" description="Welcome to your admin dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPilgrims} pilgrims, {stats.totalAgencies} agencies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalBookings} bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPackages}</div>
              <p className="text-xs text-muted-foreground">Hajj & Umrah packages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">{stats.verifiedAgencies} verified agencies</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={userGrowthData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Monthly revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={revenueData} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Package Types</CardTitle>
              <CardDescription>Distribution of Hajj & Umrah packages</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={packageTypeData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Booking Statuses</CardTitle>
              <CardDescription>Distribution of booking statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={bookingStatusData} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest bookings across all agencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {stats.recentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-3 text-left font-medium">ID</th>
                        <th className="p-3 text-left font-medium">User</th>
                        <th className="p-3 text-left font-medium">Agency</th>
                        <th className="p-3 text-left font-medium">Package</th>
                        <th className="p-3 text-left font-medium">Date</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Amount</th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings.map((booking, index) => (
                        <tr key={booking.id || index} className="border-t">
                          <td className="p-3">#{booking.id?.substring(0, 6) || `BOOK${index + 1}`}</td>
                          <td className="p-3">{booking.userName || "User"}</td>
                          <td className="p-3">{booking.agencyName || "Agency"}</td>
                          <td className="p-3">{booking.packageName || "Package"}</td>
                          <td className="p-3">{formatDate(booking.createdAt) || "N/A"}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Pending"}
                            </span>
                          </td>
                          <td className="p-3">₦{(booking.totalPrice || 0).toLocaleString()}</td>
                          <td className="p-3">
                            <Link href={`/dashboard/admin/bookings/${booking.id || index}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <History className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No recent bookings</h3>
                  <p className="text-sm text-muted-foreground">Recent bookings will appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboardPage