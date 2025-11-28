"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { getBookingById } from "@/lib/firebase/firestore"
import { getPackageById } from "@/lib/firebase/firestore"
import { BookingDetails } from "@/components/booking/booking-details"
import { PackageDetails } from "@/components/booking/package-details"
import { PaystackPayment } from "@/components/paystack-payment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Printer, ArrowLeft } from "lucide-react"
import { printElement, downloadBookingDetails} from "@/utils/print-utils"

const BookingPage = () => {
  const params = useParams()
  const id = params && typeof params.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : ""
  const router = useRouter()
  const { user } = useAuth()

  type Booking = {
    id: string
    paymentStatus?: string
    packageId?: string
    totalPrice?: number
    userEmail?: string
    userName?: string
    // add other properties as needed
  }

  const [bookingData, setBookingData] = useState<Booking | null>(null)
  const [packageData, setPackageData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentComplete, setPaymentComplete] = useState(false)

  useEffect(() => {
    const fetchBookingData = async () => {
      setIsLoading(true)
      try {
        const booking = await getBookingById(id) as Booking
        setBookingData(booking)

        // Check if payment is already complete
        if (booking?.paymentStatus === "paid" || booking?.paymentStatus === "confirmed") {
          setPaymentComplete(true)
        }

        if (booking?.packageId) {
          const packageDetails = await getPackageById(booking.packageId)
          setPackageData(packageDetails)
        }
      } catch (error) {
        console.error("Error fetching booking data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch booking details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingData()
  }, [id])

  const handlePaymentSuccess = (reference: string) => {
    toast({
      title: "Payment Successful",
      description: "Your booking has been confirmed with Almutamir!",
    })
    setPaymentComplete(true)
  }

  const handlePrintBooking = () => {
    printElement("booking-details")
  }

  const handleDownloadBooking = async () => {
    if (bookingData) {
      try {
        await downloadBookingDetails(id, {
          ...bookingData,
          packageDetails: packageData,
        })
        toast({
          title: "Download Complete",
          description: "Your Almutamir booking confirmation has been downloaded as PDF.",
        })
      } catch (error) {
        console.error("Error downloading PDF:", error)
        toast({
          title: "Download Error",
          description: "Failed to download booking confirmation PDF.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
            <CardDescription>The Almutamir booking you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/pilgrim/bookings")} className="w-full">
              View My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-center">Almutamir Booking Details</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div id="booking-details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>Details about your Almutamir booking</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingDetails booking={bookingData} />
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
              <CardDescription>Details about the Almutamir package you booked</CardDescription>
            </CardHeader>
            <CardContent>
              {packageData ? <PackageDetails packageDetails={packageData} /> : <p>No package details available.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment or Confirmation Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{paymentComplete ? "Booking Completed" : "Complete Your Payment"}</CardTitle>
          <CardDescription>
            {paymentComplete
              ? "Your Almutamir booking has been completed. You can download or print your confirmation."
              : "Complete your payment to confirm your Almutamir booking"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentComplete ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                <p className="font-medium">Your Almutamir booking has been completed!</p>
                <p className="text-sm mt-1">
                  Booking reference: <span className="font-mono font-bold">{id.substring(0, 8).toUpperCase()}</span>
                </p>
              </div>

              <Tabs defaultValue="download">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="download">Download PDF</TabsTrigger>
                  <TabsTrigger value="print">Print</TabsTrigger>
                </TabsList>
                <TabsContent value="download" className="pt-4">
                  <p className="text-sm mb-4">
                    Download your Almutamir booking confirmation as PDF for your records. You'll need this for check-in.
                  </p>
                  <Button onClick={handleDownloadBooking} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Confirmation
                  </Button>
                </TabsContent>
                <TabsContent value="print" className="pt-4">
                  <p className="text-sm mb-4">Print your Almutamir booking confirmation.</p>
                  <Button onClick={handlePrintBooking} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Confirmation
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            bookingData && (
              <PaystackPayment
                amount={bookingData.totalPrice ?? 0}
                email={user?.email || bookingData.userEmail}
                name={user?.displayName || bookingData.userName}
                bookingId={bookingData.id}
                packageId={packageData?.id}
                agencyId={packageData?.agencyId}
                pilgrimId={user?.uid}
                redirectToLogin={true}
                onSuccess={handlePaymentSuccess}
                onClose={() => {
                  // Handle payment window close
                }}
              />
            )
          )}
        </CardContent>
        {paymentComplete && (
          <CardFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/pilgrim/bookings")} className="w-full">
              View All My Almutamir Bookings
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default BookingPage