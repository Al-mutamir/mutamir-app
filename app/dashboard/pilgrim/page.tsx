"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getPilgrimStats } from "@/lib/firebase/firestore"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CreditCard, Package, CheckCircle, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

const PilgrimDashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    bookings: [],
    upcomingBookings: [],
    completedBookings: [],
    cancelledBookings: [],
    totalPaid: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        // Fetch all bookings for this pilgrim
        const pilgrimStats = await getPilgrimStats(user.uid)
        // Filter bookings by userId
        const userBookings = (pilgrimStats.bookings || []).filter(
          (booking) => booking.userId === user.uid
        )

        // Completed trips
        const completedBookings = userBookings.filter(
          (booking) => booking.status === "completed"
        )

        // Upcoming bookings (not completed, future date)
        const now = new Date()
        const upcomingBookings = userBookings
          .filter(
            (booking) =>
              booking.status !== "completed" &&
              new Date(booking.departureDate) > now
          )
          .sort(
            (a, b) =>
              new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
          )

        // Next trip: soonest upcoming booking
        const nextTrip = upcomingBookings.length > 0 ? upcomingBookings[0] : null

        // Total paid
        const totalPaid = userBookings.reduce(
          (sum, booking) =>
            sum +
            (booking.paymentStatus === "paid" || booking.status === "completed"
              ? booking.totalPrice || 0
              : 0),
          0
        )

        setStats({
          bookings: userBookings,
          upcomingBookings,
          completedBookings,
          cancelledBookings: userBookings.filter((b) => b.status === "cancelled"),
          totalPaid,
          recentActivity: pilgrimStats.recentActivity || [],
          nextTrip,
        })
      } catch (err) {
        console.error("Error fetching pilgrim data:", err)
        setError("Failed to load your dashboard data. Please try again later.")

        // Set mock data for development
        setStats({
          bookings: [],
          upcomingBookings: [
            {
              id: "up1",
              packageName: "Umrah Basic Package",
              departureDate: new Date("2023-12-15"),
              status: "confirmed",
              totalPrice: 250000,
            },
            {
              id: "up2",
              packageName: "Hajj Premium Package",
              departureDate: new Date("2024-06-10"),
              status: "pending",
              totalPrice: 1200000,
            },
          ],
          completedBookings: [
            {
              id: "comp1",
              packageName: "Umrah Standard Package",
              departureDate: new Date("2023-03-20"),
              status: "completed",
              totalPrice: 350000,
            },
          ],
          cancelledBookings: [],
          totalPaid: 600000,
          recentActivity: [
            {
              type: "booking",
              date: new Date("2023-11-01"),
              data: { packageName: "Umrah Basic Package", status: "confirmed", totalPrice: 250000 },
            },
            { type: "payment", date: new Date("2023-11-02"), data: { amount: 250000, method: "Card Payment" } },
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

    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <DashboardLayout userType="pilgrim" title="Dashboard" description="Welcome to your pilgrim dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading your dashboard data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="pilgrim" title="Dashboard" description="Welcome to your pilgrim dashboard">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-lg text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="pilgrim" title="Dashboard" description="Welcome to your pilgrim dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings.length}</div>
            <p className="text-xs text-muted-foreground">{stats.upcomingBookings.length} upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">Across all bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings.length}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Trip</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nextTrip
                ? formatDate(stats.nextTrip.departureDate)
                : "No trips planned"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.nextTrip ? stats.nextTrip.packageName : "Book your next journey"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="rounded-md border">
            {stats.upcomingBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left font-medium">Package</th>
                      <th className="p-3 text-left font-medium">Departure</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Amount</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upcomingBookings.map((booking) => (
                      <tr key={booking.id} className="border-t">
                        <td className="p-3">{booking.packageName}</td>
                        <td className="p-3">{formatDate(booking.departureDate)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">{formatCurrency(booking.totalPrice)}</td>
                        <td className="p-3">
                          <Link href={`/dashboard/pilgrim/bookings/${booking.id}`}>
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
                <Package className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No upcoming bookings</h3>
                <p className="text-sm text-muted-foreground mb-4">You don't have any upcoming trips scheduled.</p>
                <Link href="/standard-packages">
                  <Button>Browse Packages</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <div className="rounded-md border">
            {stats.recentActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-left font-medium">Type</th>
                      <th className="p-3 text-left font-medium">Details</th>
                      <th className="p-3 text-left font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.map((activity, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{formatDate(activity.date)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              activity.type === "payment"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          {activity.type === "payment"
                            ? `Payment via ${activity.data.method}`
                            : `${activity.data.packageName} (${activity.data.status})`}
                        </td>
                        <td className="p-3">
                          {activity.type === "payment"
                            ? formatCurrency(activity.data.amount)
                            : formatCurrency(activity.data.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Activity className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No recent activity</h3>
                <p className="text-sm text-muted-foreground">Your recent activities will appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default PilgrimDashboardPage
