"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { getBookingsByAgency, getUserData, updateBooking } from "@/lib/firebase/firestore"
import type { Booking, UserData } from "@/firebase/firestore"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Loader2, Mail, Phone, Check, X, Search, Download, Users, CreditCard } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { format, isAfter, isBefore } from "date-fns"

// Type for partial user data that might be incomplete
type PartialUserData = Partial<UserData> & { id?: string }

export default function AgencyClients() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pilgrims, setPilgrims] = useState<Record<string, PartialUserData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  async function fetchData() {
    if (user) {
      try {
        setLoading(true)
        const fetchedBookings = await getBookingsByAgency(user.uid)
        setBookings(fetchedBookings)

        // Get unique pilgrim IDs
        const pilgrimIds = Array.from(new Set(fetchedBookings.map((booking) => booking.pilgrimId)))

        // Fetch pilgrim data for each unique ID
        const pilgrimData: Record<string, PartialUserData> = {}
        for (const id of pilgrimIds) {
          if (!id) continue
          try {
            const data = await getUserData(id)
            // Store the data, handling both complete and partial user data
            pilgrimData[id] = data || { id }
          } catch (error) {
            console.error(`Error fetching user data for ${id}:`, error)
            // Store minimal data for failed fetches
            pilgrimData[id] = { id }
          }
        }
        setPilgrims(pilgrimData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load client data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  // Filter bookings based on active tab, search query, status filter, and date filter
  const filteredBookings = bookings.filter((booking) => {
    // Filter by tab
    if (activeTab === "all") {
      // Continue to other filters
    } else if (activeTab === "confirmed" && booking.status !== "confirmed") {
      return false
    } else if (activeTab === "pending" && booking.status !== "pending") {
      return false
    } else if (activeTab === "completed" && booking.status !== "completed") {
      return false
    } else if (activeTab === "cancelled" && booking.status !== "cancelled") {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const pilgrimData = pilgrims[booking.pilgrimId]
      const query = searchQuery.toLowerCase()
      const matchesName = pilgrimData?.displayName?.toLowerCase().includes(query) || false
      const matchesEmail = pilgrimData?.email?.toLowerCase().includes(query) || false
      const matchesId = booking.id?.toLowerCase().includes(query) || false
      // Fixed: Use packageName instead of packageTitle if that's the correct property
      const matchesPackage = booking.packageTitle?.toLowerCase().includes(query) || false

      if (!(matchesName || matchesEmail || matchesId || matchesPackage)) {
        return false
      }
    }

    // Filter by status
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false
    }

    // Filter by date
    if (dateFilter !== "all") {
      const bookingDate =
        booking.travelDate instanceof Date ? booking.travelDate : new Date(booking.travelDate as string)

      const today = new Date()

      if (dateFilter === "upcoming" && !isAfter(bookingDate, today)) {
        return false
      } else if (dateFilter === "past" && !isBefore(bookingDate, today)) {
        return false
      } else if (dateFilter === "thisMonth") {
        const thisMonth = today.getMonth()
        const thisYear = today.getFullYear()
        const bookingMonth = bookingDate.getMonth()
        const bookingYear = bookingDate.getFullYear()

        if (bookingMonth !== thisMonth || bookingYear !== thisYear) {
          return false
        }
      } else if (dateFilter === "nextMonth") {
        let nextMonth = today.getMonth() + 1
        let nextMonthYear = today.getFullYear()

        if (nextMonth > 11) {
          nextMonth = 0
          nextMonthYear += 1
        }

        const bookingMonth = bookingDate.getMonth()
        const bookingYear = bookingDate.getFullYear()

        if (bookingMonth !== nextMonth || bookingYear !== nextMonthYear) {
          return false
        }
      }
    }

    return true
  })

  // Calculate statistics
  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length
  const pendingBookings = bookings.filter(b => b.status === "pending").length
  const completedBookings = bookings.filter((b) => b.status === "completed").length
  const cancelledBookings = bookings.filter(b => b.status === "cancelled").length

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
  // Fixed: Use correct payment status values
  const paidBookings = bookings.filter((b) => b.paymentStatus === "paid").length
  const pendingPayments = bookings.filter((b) => b.paymentStatus === "unpaid" || b.paymentStatus === "partial").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["agency", "admin"]}>
        <DashboardLayout userType="agency">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading client data...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["agency", "admin"]}>
        <DashboardLayout userType="agency">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              <p className="font-medium">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  // Add this function inside your component
  function exportBookingsToCSV() {
    if (filteredBookings.length === 0) {
      alert("There is no data to export.")
      return
    }
    const headers = [
      "Booking ID",
      "Package Name",
      "Status",
      "Payment Status",
      "Total Price",
      "Travel Date",
      "Return Date",
      "Pilgrim Name",
      "Pilgrim Email",
      "Passport Number"
    ]
    const rows = filteredBookings.map((booking) => {
      const pilgrimData = pilgrims[booking.pilgrimId]
      return [
        booking.id,
        booking.packageTitle || "N/A", // Handle both possible property names
        booking.status,
        booking.paymentStatus,
        booking.totalPrice,
        booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "",
        booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : "",
        pilgrimData?.displayName || "",
        pilgrimData?.email || "",
        pilgrimData?.passportNumber || ""
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
    })
    const csvContent = [headers.join(","), ...rows].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bookings.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Update the AgencyClients component to use the title prop
  return (
    <ProtectedRoute allowedRoles={["agency", "admin"]}>
      <DashboardLayout userType="agency" title="Clients & Bookings">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/agency">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-6 w-6 text-blue-600" />
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
                  <Calendar className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <h3 className="text-2xl font-bold">{pendingBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <X className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Cancelled</p>
                    <h3 className="text-2xl font-bold">{cancelledBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or booking ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="thisMonth">This Month</option>
              <option value="nextMonth">Next Month</option>
            </select>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportBookingsToCSV}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking List</CardTitle>
                  <CardDescription>
                    Showing {filteredBookings.length} of {bookings.length} bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredBookings.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No bookings found</h3>
                        <p className="text-muted-foreground mt-2">
                          {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                            ? "Try adjusting your filters"
                            : "You don't have any bookings yet"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking) => {
                        const pilgrimData = pilgrims[booking.pilgrimId]
                        const travelDate =
                          booking.travelDate instanceof Date
                            ? booking.travelDate
                            : booking.travelDate
                              ? new Date(booking.travelDate as string)
                              : null

                        const returnDate =
                          booking.returnDate instanceof Date
                            ? booking.returnDate
                            : booking.returnDate
                              ? new Date(booking.returnDate as string)
                              : null

                        return (
                          <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                                <div className="p-4 flex flex-col justify-between bg-gray-50">
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">{booking.packageTitle || "Package Booking"}</p>
                                        <p className="text-sm text-gray-500">ID: {booking.id?.substring(0, 8)}</p>
                                      </div>
                                      <Badge className={getStatusColor(booking.status)}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="mt-2 flex items-center">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage
                                          src={
                                            pilgrimData?.gender === "female"
                                              ? "/images/hijab.png"
                                              : "/images/muslim.png"
                                          }
                                          alt={pilgrimData?.displayName || "Pilgrim"}
                                        />
                                        <AvatarFallback>
                                          {pilgrimData?.displayName
                                            ? pilgrimData.displayName.substring(0, 2).toUpperCase()
                                            : "P"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <p className="text-sm">{pilgrimData?.displayName || "Pilgrim"}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 flex items-center">
                                  <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium">Travel Dates</p>
                                      <p className="text-sm text-gray-500">
                                        {travelDate && !isNaN(travelDate.getTime()) && returnDate && !isNaN(returnDate.getTime())
                                          ? `${format(travelDate, "MMM d, yyyy")} - ${format(returnDate, "MMM d, yyyy")}`
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 flex items-center">
                                  <div>
                                    <p className="text-sm font-medium">Payment Status</p>
                                    <div className="flex items-center mt-1">
                                      {booking.paymentStatus === "paid" ? (
                                        <Badge className="bg-green-100 text-green-800 flex items-center">
                                          <Check className="h-3 w-3 mr-1" /> Paid
                                        </Badge>
                                      ) : booking.paymentStatus === "partial" ? (
                                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" /> Partial
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-red-100 text-red-800 flex items-center">
                                          <X className="h-3 w-3 mr-1" /> Unpaid
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium mt-2">
                                      ₦{booking.totalPrice?.toLocaleString() || 0}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-4 flex items-center justify-center">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="w-full">
                                        View Details
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Booking Details</DialogTitle>
                                        <DialogDescription>Booking ID: {booking.id?.substring(0, 8)}</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="flex items-center space-x-4">
                                          <Avatar className="h-16 w-16">
                                            <AvatarImage
                                              src={
                                                pilgrimData?.gender === "female"
                                                  ? "/images/hijab.png"
                                                  : "/images/muslim.png"
                                              }
                                              alt={pilgrimData?.displayName || "Pilgrim"}
                                            />
                                            <AvatarFallback className="text-lg">
                                              {pilgrimData?.displayName
                                                ? pilgrimData.displayName.substring(0, 2).toUpperCase()
                                                : "P"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h3 className="text-xl font-bold">
                                              {pilgrimData?.displayName || "Pilgrim"}
                                            </h3>
                                            <p className="text-muted-foreground">
                                              {pilgrimData?.countryOfResidence || booking.countryOfResidence}
                                              {(pilgrimData?.cityOfResidence || booking.cityOfResidence) && 
                                                `, ${pilgrimData?.cityOfResidence || booking.cityOfResidence}`}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <h4 className="text-sm font-medium">Contact Information</h4>
                                          <div className="grid gap-2">
                                            <div className="flex items-center">
                                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                              <span>{pilgrimData?.email || booking.userEmail || "No email provided"}</span>
                                            </div>
                                            <div className="flex items-center">
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <h4 className="text-sm font-medium">Passport Number</h4>
                                          <p className="text-sm">{pilgrimData?.passportNumber || booking.passportNumber || "Not provided"}</p>
                                        </div>

                                        <div className="space-y-2">
                                          <h4 className="text-sm font-medium">Booking Status</h4>
                                          <Badge className={getStatusColor(booking.status)}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {booking.status === "pending" && (
                                          <>
                                            <Button
                                              className="flex-1"
                                              onClick={async () => {
                                                await updateBooking(booking.id, { status: "confirmed" })
                                                fetchData()
                                              }}
                                            >
                                              Confirm Booking
                                            </Button>
                                            <Button
                                              className="flex-1"
                                              variant="destructive"
                                              onClick={async () => {
                                                await updateBooking(booking.id, { status: "cancelled" })
                                                fetchData()
                                              }}
                                            >
                                              Cancel Booking
                                            </Button>
                                          </>
                                        )}
                                        {booking.status === "confirmed" && (
                                          <Button
                                            className="flex-1"
                                            onClick={async () => {
                                              await updateBooking(booking.id, { status: "completed" })
                                              fetchData()
                                            }}
                                          >
                                            Mark as Completed
                                          </Button>
                                        )}
                                        <DialogClose asChild>
                                          <Button variant="outline" className="flex-1">
                                            Close
                                          </Button>
                                        </DialogClose>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}