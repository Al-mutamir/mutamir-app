"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getAgencyStats } from "@/lib/firebase/firestore"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/chart"
import { CalendarDays, CreditCard, Package, Building, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

const AgencyDashboardPage = () => {
  const { user } = useAuth()
  type Booking = {
    id: string
    clientName: string
    packageName: string
    travelDate?: Date | string | number | { toDate: () => Date }
    createdAt?: Date | string | number | { toDate: () => Date }
    status: string
    totalPrice: number
  }

  type PackagePerformance = {
    id: string
    name: string
    bookingCount: number
    maxCapacity: number
    fillPercentage: number
  }

  interface Stats {
    bookings: Booking[]
    packages: any[]
    totalBookings: number
    confirmedBookings: number
    pendingBookings: number
    completedBookings: number
    cancelledBookings: number
    totalRevenue: number
    confirmedRevenue: number
    activePackages: number
    draftPackages: number
    upcomingBookings: Booking[]
    recentBookings: Booking[]
    packagePerformance: PackagePerformance[]
  }

  const [stats, setStats] = useState<Stats>({
    bookings: [],
    packages: [],
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    confirmedRevenue: 0,
    activePackages: 0,
    draftPackages: 0,
    upcomingBookings: [],
    recentBookings: [],
    packagePerformance: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const agencyStats = await getAgencyStats(user.uid)
        const now = new Date()
        const thirtyDaysFromNow = new Date(now)
        thirtyDaysFromNow.setDate(now.getDate() + 30)

        // Only active packages with departureDate in the next 30 days
        const upcomingTrips = (agencyStats.packages || []).filter((pkg) => {
          if (pkg.status !== "active" || !pkg.departureDate) return false
          let depDate
          if (typeof pkg.departureDate === "object" && "toDate" in pkg.departureDate) {
            depDate = pkg.departureDate.toDate()
          } else {
            depDate = new Date(pkg.departureDate)
          }
          return depDate >= now && depDate <= thirtyDaysFromNow
        })

        setStats((prev) => ({
          ...prev,
          packages: agencyStats.packages || [],
          activePackages: (agencyStats.packages || []).length, // <-- Total number of packages
          upcomingTrips, // <-- set the filtered trips here
          recentBookings: agencyStats.recentBookings || [],
          totalBookings: agencyStats.totalBookings || 0,
          confirmedBookings: agencyStats.confirmedBookings || 0,
          pendingBookings: agencyStats.pendingBookings || 0,
          completedBookings: agencyStats.completedBookings || 0,
          cancelledBookings: agencyStats.cancelledBookings || 0,
          totalRevenue: agencyStats.totalRevenue || 0,
          confirmedRevenue: agencyStats.confirmedRevenue || 0,
          draftPackages: agencyStats.draftPackages || 0,
          packagePerformance: agencyStats.packagePerformance || [],
        }))
      } catch (err) {
        console.error("Error fetching agency data:", err)
        setError("Failed to load your dashboard data. Please try again later.")

        // Set mock data for development
        setStats({
          bookings: [],
          packages: [],
          totalBookings: 45,
          confirmedBookings: 32,
          pendingBookings: 8,
          completedBookings: 5,
          cancelledBookings: 0,
          totalRevenue: 4500000,
          confirmedRevenue: 3200000,
          activePackages: 12,
          draftPackages: 3,
          upcomingBookings: [
            {
              id: "up1",
              clientName: "Ahmed Mohammed",
              packageName: "Umrah Basic Package",
              travelDate: new Date("2023-12-15"),
              status: "confirmed",
              totalPrice: 250000,
            },
            {
              id: "up2",
              clientName: "Fatima Ali",
              packageName: "Hajj Premium Package",
              travelDate: new Date("2024-06-10"),
              status: "pending",
              totalPrice: 1200000,
            },
          ],
          recentBookings: [
            {
              id: "rec1",
              clientName: "Ibrahim Hassan",
              packageName: "Umrah Standard Package",
              createdAt: new Date("2023-11-05"),
              status: "confirmed",
              totalPrice: 350000,
            },
            {
              id: "rec2",
              clientName: "Aisha Yusuf",
              packageName: "Umrah Basic Package",
              createdAt: new Date("2023-11-02"),
              status: "pending",
              totalPrice: 250000,
            },
          ],
          packagePerformance: [
            { id: "pkg1", name: "Umrah Basic Package", bookingCount: 18, maxCapacity: 30, fillPercentage: 60 },
            { id: "pkg2", name: "Hajj Premium Package", bookingCount: 12, maxCapacity: 20, fillPercentage: 60 },
            { id: "pkg3", name: "Umrah Plus Package", bookingCount: 8, maxCapacity: 15, fillPercentage: 53 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.uid])

  const formatDate = (date) => {
    if (!date) return "N/A"

    try {
      // Handle Firestore Timestamp objects
      if (date && typeof date === "object" && "toDate" in date) {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      // Handle string dates
      if (typeof date === "string") {
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      // Handle Date objects
      if (date instanceof Date) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      // Handle timestamp numbers
      if (typeof date === "number") {
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      // Fallback for unknown formats
      return "Invalid Date"
    } catch (error) {
      console.error("Error formatting date:", error, date)
      return "Invalid Date"
    }
  }

  // Chart data
  const bookingChartData = {
    labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
    datasets: [
      {
        label: "Bookings",
        data: [stats.confirmedBookings, stats.pendingBookings, stats.completedBookings, stats.cancelledBookings],
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

  const packageChartData = {
    labels: stats.packagePerformance.map((pkg) => pkg.name),
    datasets: [
      {
        label: "Bookings",
        data: stats.packagePerformance.map((pkg) => pkg.bookingCount),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  }

  if (loading) {
    return (
      <DashboardLayout userType="agency" title="Dashboard" description="Welcome to your agency dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading your dashboard data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="agency" title="Dashboard" description="Welcome to your agency dashboard">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-lg text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="agency" title="Dashboard" description="Welcome to your agency dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">{stats.confirmedBookings} confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.confirmedRevenue)} confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePackages}</div>
            <p className="text-xs text-muted-foreground">{stats.draftPackages} drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTrips.length}</div>
            <p className="text-xs text-muted-foreground">In the next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Package Performance</CardTitle>
            <CardDescription>Number of bookings per package</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={packageChartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution of booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart data={bookingChartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
          <TabsTrigger value="recent">Recent Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="rounded-md border">
            {stats.upcomingTrips && stats.upcomingTrips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left font-medium">Package</th>
                      <th className="p-3 text-left font-medium">Departure Date</th>
                      <th className="p-3 text-left font-medium">Capacity</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upcomingTrips.map((pkg) => (
                      <tr key={pkg.id} className="border-t">
                        <td className="p-3">{pkg.name || pkg.title}</td>
                        <td className="p-3">{formatDate(pkg.departureDate)}</td>
                        <td className="p-3">{pkg.groupSize || "N/A"}</td>
                        <td className="p-3">
                          <Link href={`/packages/${pkg.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
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
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No upcoming trips</h3>
                <p className="text-sm text-muted-foreground mb-4">You don't have any upcoming trips scheduled.</p>
                <Link href="/dashboard/agency/packages/create">
                  <Button>Create Package</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <div className="rounded-md border">
            {stats.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left font-medium">Client</th>
                      <th className="p-3 text-left font-medium">Package</th>
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Amount</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-t">
                        <td className="p-3">{booking.clientName}</td>
                        <td className="p-3">{booking.packageName}</td>
                        <td className="p-3">{formatDate(booking.createdAt)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">{formatCurrency(booking.totalPrice)}</td>
                        <td className="p-3">
                          <Link href={`/dashboard/agency/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
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
                <p className="text-sm text-muted-foreground">Your recent bookings will appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default AgencyDashboardPage
