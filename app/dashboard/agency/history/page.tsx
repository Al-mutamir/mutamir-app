"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getBookingsByAgency } from "@/lib/firebase/firestore"
import { Calendar, Download, Eye, Loader2, Search, User } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

// Define the Booking interface
interface Booking {
  id: string
  pilgrimName?: string
  pilgrimEmail?: string
  packageTitle?: string
  totalPrice?: number
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt?: {
    seconds: number
    nanoseconds: number
  }
}

export default function AgencyHistoryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([]) // Properly typed
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]) // Properly typed
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all")
  const [filterDate, setFilterDate] = useState<"all" | "30days" | "90days" | "1year">("all")

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return

      try {
        setLoading(true)
        const agencyBookings = await getBookingsByAgency(user.uid)
        setBookings(agencyBookings) // Now this works without type errors
        setFilteredBookings(agencyBookings)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  // Filter bookings based on search query, status filter, and date filter
  useEffect(() => {
    if (!bookings.length) return

    let filtered = [...bookings]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.pilgrimName?.toLowerCase().includes(query) ||
          booking.pilgrimEmail?.toLowerCase().includes(query) ||
          booking.packageTitle?.toLowerCase().includes(query) ||
          booking.id?.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus)
    }

    // Apply date filter
    if (filterDate !== "all") {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.createdAt?.seconds ? booking.createdAt.seconds * 1000 : 0)

        if (filterDate === "30days") {
          return bookingDate >= thirtyDaysAgo
        } else if (filterDate === "90days") {
          return bookingDate >= ninetyDaysAgo
        } else if (filterDate === "1year") {
          return bookingDate >= oneYearAgo
        }
        return true
      })
    }

    setFilteredBookings(filtered)
  }, [searchQuery, filterStatus, filterDate, bookings])

  // Calculate statistics
  const totalBookings = bookings.length
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled").length

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["agency"]}>
        <DashboardLayout userType="agency">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["agency"]}>
      <DashboardLayout userType="agency" title="Booking History" description="View and manage your booking history">
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <h3 className="text-2xl font-bold">{totalBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold">{completedBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <h3 className="text-2xl font-bold">{pendingBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value as typeof filterDate)}
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                Showing {filteredBookings.length} of {bookings.length} bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No bookings found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || filterStatus !== "all" || filterDate !== "all"
                      ? "Try adjusting your filters"
                      : "You haven't received any bookings yet"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium">Booking ID</th>
                        <th className="text-left p-3 font-medium">Pilgrim</th>
                        <th className="text-left p-3 font-medium">Package</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking, index) => (
                        <tr key={booking.id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-muted/30"}`}>
                          <td className="p-3 font-mono text-sm">{booking.id?.substring(0, 8) || "Unknown"}</td>
                          <td className="p-3">
                            <div className="font-medium">{booking.pilgrimName || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">{booking.pilgrimEmail}</div>
                          </td>
                          <td className="p-3">{booking.packageTitle || "Unknown Package"}</td>
                          <td className="p-3">
                            {booking.createdAt
                              ? format(new Date(booking.createdAt.seconds * 1000), "MMM d, yyyy")
                              : "Unknown"}
                          </td>
                          <td className="p-3 font-medium">₦{booking.totalPrice?.toLocaleString() || "0"}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                booking.status === "completed"
                                  ? "default"
                                  : booking.status === "confirmed"
                                    ? "outline"
                                    : booking.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                              }
                              className={
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "confirmed"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.status === "pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                              }
                            >
                              {(booking.status || "").charAt(0).toUpperCase() + (booking.status || "").slice(1) || "Unknown"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Link href={`/booking/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}