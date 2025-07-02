"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CreditCardIcon, FileTextIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { getUserBookings, getUserPaymentHistory } from "@/lib/firebase/firestore"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProtectedRoute from "@/components/protected-route"

// Define interfaces for type safety
interface Booking {
  id: string
  bookingId: string
  packageName: string
  agencyName: string
  bookingDate: string
  departureDate: string
  returnDate?: string
  totalAmount: number
  status: 'confirmed' | 'cancelled' | 'pending'
  cancellationDate?: string
  cancellationReason?: string
  refundAmount?: number
}

interface Payment {
  id: string
  amount: number
  description: string
  status: 'successful' | 'pending' | 'failed'
  date: string
  method?: string
  reference?: string
}

export default function PilgrimHistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const [bookingsData, paymentsData] = await Promise.all([
          getUserBookings(user.uid),
          getUserPaymentHistory(user.uid),
        ])

        // Sort bookings by date (newest first)
        const sortedBookings = bookingsData.sort((a: Booking, b: Booking) => 
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        )

        setBookings(sortedBookings)
        setPayments(paymentsData)
      } catch (err) {
        console.error("Error fetching history:", err)
        setError("Failed to load your history. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user?.uid])

  // Get completed bookings (past departure date)
  const completedBookings = bookings.filter(
    (booking) => new Date(booking.departureDate) < new Date() && booking.status !== "cancelled",
  )

  // Get cancelled bookings
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

  const handleCertificateDownload = (bookingId: string) => {
    // TODO: Implement actual certificate download functionality
    console.log(`Downloading certificate for booking: ${bookingId}`)
    alert("Certificate download functionality will be implemented here")
  }

  const handleReceiptDownload = (paymentId: string) => {
    // TODO: Implement actual receipt download functionality
    console.log(`Downloading receipt for payment: ${paymentId}`)
    alert("Receipt download functionality will be implemented here")
  }

  const handleDocumentDownload = (documentType: string, bookingId?: string) => {
    // TODO: Implement actual document download functionality
    console.log(`Downloading ${documentType} document${bookingId ? ` for booking: ${bookingId}` : ''}`)
    alert(`${documentType} download functionality will be implemented here`)
  }

  const content = (
    <div className="container mx-auto">
      <Tabs defaultValue="bookings" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">Completed Bookings</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {completedBookings.length > 0 ? (
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{booking.packageName}</h3>
                        <p className="text-muted-foreground">{booking.agencyName}</p>
                      </div>
                      <Badge variant="secondary" className="mt-2 md:mt-0 w-fit">
                        Completed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Booking Date</p>
                        <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Departure Date</p>
                        <p className="font-medium">{new Date(booking.departureDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return Date</p>
                        <p className="font-medium">
                          {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium">
                          {(booking.totalAmount || 0).toLocaleString("en-US", {
                            style: "currency",
                            currency: "NGN",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button variant="outline" className="mr-2" onClick={() => router.push(`/booking/${booking.id}`)}>
                        View Details
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleCertificateDownload(booking.id)}
                      >
                        Download Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No completed bookings</h3>
              <p className="text-muted-foreground mt-1">You don't have any completed Hajj or Umrah trips yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {cancelledBookings.length > 0 ? (
            <div className="space-y-4">
              {cancelledBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{booking.packageName}</h3>
                        <p className="text-muted-foreground">{booking.agencyName}</p>
                      </div>
                      <Badge variant="destructive" className="mt-2 md:mt-0 w-fit">
                        Cancelled
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Booking Date</p>
                        <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cancellation Date</p>
                        <p className="font-medium">
                          {booking.cancellationDate ? new Date(booking.cancellationDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Refund Amount</p>
                        <p className="font-medium">
                          {(booking.refundAmount || 0).toLocaleString("en-US", {
                            style: "currency",
                            currency: "NGN",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Cancellation Reason</p>
                      <p>{booking.cancellationReason || "No reason provided"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No cancelled bookings</h3>
              <p className="text-muted-foreground mt-1">You don't have any cancelled bookings</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments">
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {payment.amount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "NGN",
                          })}
                        </h3>
                        <p className="text-muted-foreground">{payment.description}</p>
                      </div>
                      <Badge
                        variant={payment.status === "successful" ? "default" : "secondary"}
                        className={`mt-2 md:mt-0 w-fit ${
                          payment.status === "successful" 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : payment.status === "failed" 
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : ""
                        }`}
                      >
                        {payment.status === "successful" ? "Successful" : 
                         payment.status === "failed" ? "Failed" : 
                         "Pending"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Date</p>
                        <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium">{payment.method || "Card"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <p className="font-medium">{payment.reference || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleReceiptDownload(payment.id)}
                      >
                        Download Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <CreditCardIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No payment history</h3>
              <p className="text-muted-foreground mt-1">You haven't made any payments yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center p-4 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full mr-4">
                        <FileTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{booking.packageName} Certificate</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date(booking.returnDate || booking.departureDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDocumentDownload("Certificate", booking.id)}
                      >
                        Download
                      </Button>
                    </div>
                  ))}

                  {/* Example visa document */}
                  {completedBookings.length > 0 && (
                    <div className="flex items-center p-4 border rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-4">
                        <FileTextIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Visa Documentation</h4>
                        <p className="text-sm text-muted-foreground">
                          Last updated on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDocumentDownload("Visa Documentation")}
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No documents available</h3>
                  <p className="text-muted-foreground mt-1">
                    Complete a Hajj or Umrah trip to receive certificates and documents
                  </p>
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
          <h1 className="text-3xl font-bold mb-6">History</h1>
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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