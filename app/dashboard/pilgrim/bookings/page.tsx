"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, SearchIcon, PackageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { getUserBookings } from "@/lib/firebase/firestore"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProtectedRoute from "@/components/protected-route"

// Define interfaces for type safety
interface Booking {
  id: string
  bookingId: string
  packageName: string
  agencyName: string
  departureDate: string
  amountPaid: number
  status: 'confirmed' | 'cancelled' | 'pending'
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  day: number
}

type StatusFilter = 'all' | 'upcoming' | 'past' | 'cancelled'

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [calendarBookings, setCalendarBookings] = useState<Record<string, Booking[]>>({})

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const bookingsData = await getUserBookings(user.uid)
        setBookings(bookingsData)
        setFilteredBookings(bookingsData)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load your bookings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user?.uid])

  useEffect(() => {
    let result = [...bookings]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.packageName?.toLowerCase().includes(query) ||
          booking.agencyName?.toLowerCase().includes(query) ||
          booking.bookingId?.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const now = new Date()

      if (statusFilter === "upcoming") {
        result = result.filter((booking) => new Date(booking.departureDate) > now)
      } else if (statusFilter === "past") {
        result = result.filter((booking) => new Date(booking.departureDate) <= now)
      } else if (statusFilter === "cancelled") {
        result = result.filter((booking) => booking.status === "cancelled")
      }
    }

    setFilteredBookings(result)
  }, [searchQuery, statusFilter, bookings])

  // Generate calendar days for the current month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()

      // First day of the month
      const firstDay = new Date(year, month, 1)
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0)

      // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDay.getDay()

      // Calculate days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek
      const prevMonthLastDay = new Date(year, month, 0).getDate()

      const days: CalendarDay[] = []

      // Add days from previous month
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i
        days.push({
          date: new Date(year, month - 1, day),
          isCurrentMonth: false,
          day,
        })
      }

      // Add days from current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push({
          date: new Date(year, month, day),
          isCurrentMonth: true,
          day,
        })
      }

      // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
      const remainingDays = 42 - days.length
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          date: new Date(year, month + 1, day),
          isCurrentMonth: false,
          day,
        })
      }

      setCalendarDays(days)
    }

    generateCalendarDays()
  }, [currentMonth])

  // Map bookings to calendar days
  useEffect(() => {
    const mapBookingsToCalendar = () => {
      const bookingMap: Record<string, Booking[]> = {}

      bookings.forEach((booking) => {
        if (booking.departureDate) {
          const departureDate = new Date(booking.departureDate)
          const dateKey = departureDate.toISOString().split("T")[0]

          if (!bookingMap[dateKey]) {
            bookingMap[dateKey] = []
          }

          bookingMap[dateKey].push(booking)
        }
      })

      setCalendarBookings(bookingMap)
    }

    mapBookingsToCalendar()
  }, [bookings])

  const getStatusBadge = (booking: Booking) => {
    const now = new Date()
    const departureDate = new Date(booking.departureDate)

    if (booking.status === "cancelled") {
      return <Badge variant="destructive">Cancelled</Badge>
    } else if (departureDate <= now) {
      return <Badge variant="secondary">Completed</Badge>
    } else {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Upcoming
        </Badge>
      )
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDownloadItinerary = (bookingId: string) => {
    // TODO: Implement actual itinerary download functionality
    console.log(`Downloading itinerary for booking: ${bookingId}`)
    alert("Itinerary download functionality will be implemented here")
  }

  const content = (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => router.push("/standard-packages")}>Browse Packages</Button>
      </div>

      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-primary/10 p-6 flex items-center justify-center md:w-1/4">
                      <PackageIcon className="h-16 w-16 text-primary" />
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{booking.packageName}</h3>
                          <p className="text-muted-foreground">{booking.agencyName}</p>
                        </div>
                        <div className="mt-2 md:mt-0">{getStatusBadge(booking)}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Booking ID</p>
                          <p className="font-medium">{booking.bookingId || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Departure Date</p>
                          <p className="font-medium flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(booking.departureDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="font-medium">
                            {(booking.amountPaid || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "NGN",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => router.push(`/booking/${booking.id}`)}
                        >
                          View Details
                        </Button>
                        {new Date(booking.departureDate) > new Date() && booking.status !== "cancelled" && (
                          <Button
                            variant="secondary"
                            onClick={() => handleDownloadItinerary(booking.id)}
                          >
                            Download Itinerary
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No bookings found</h3>
              <p className="text-muted-foreground mt-1">
                {bookings.length > 0
                  ? "Try adjusting your filters or search query"
                  : "You haven't made any bookings yet"}
              </p>
              {bookings.length === 0 && (
                <Button className="mt-4" onClick={() => router.push("/standard-packages")}>
                  Browse Packages
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Booking Calendar</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{formatMonthYear(currentMonth)}</span>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dateKey = day.date.toISOString().split("T")[0]
                  const dayBookings = calendarBookings[dateKey] || []
                  const hasBookings = dayBookings.length > 0

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-1 border rounded-md ${
                        day.isCurrentMonth
                          ? isToday(day.date)
                            ? "bg-primary/10 border-primary"
                            : "bg-background hover:bg-accent/10"
                          : "bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${isToday(day.date) ? "text-primary" : ""}`}>
                          {day.day}
                        </span>
                        {hasBookings && <Badge className="text-xs">{dayBookings.length}</Badge>}
                      </div>

                      <div className="mt-1 space-y-1">
                        {hasBookings &&
                          dayBookings.slice(0, 2).map((booking, idx) => (
                            <div
                              key={booking.id}
                              className="text-xs p-1 rounded bg-primary/10 truncate cursor-pointer hover:bg-primary/20"
                              onClick={() => router.push(`/booking/${booking.id}`)}
                            >
                              {booking.packageName}
                            </div>
                          ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {bookings.length === 0 && (
                <div className="text-center py-6 mt-4">
                  <p className="text-muted-foreground">No bookings to display in calendar view</p>
                  <Button className="mt-4" onClick={() => router.push("/standard-packages")}>
                    Browse Packages
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout userType="pilgrim">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-48" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="pilgrim">
        <div className="container mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["pilgrim", "admin"]} requiredRole="pilgrim">
      <DashboardLayout userType="pilgrim">{content}</DashboardLayout>
    </ProtectedRoute>
  )
}