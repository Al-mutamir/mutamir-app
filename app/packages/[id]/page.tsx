"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  CheckCircle,
  ArrowRight,
  Package,
  ChevronLeft,
  Share2,
  Phone,
  Mail,
  LogIn,
  XCircle,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getAgencyById } from "@/lib/firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { createBooking } from "@/lib/firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { PaystackButton } from "react-paystack"
import { Loader2 } from "lucide-react"

type PackageService = {
  visa?: boolean
  flight?: boolean
  transport?: boolean
  food?: boolean
  guide?: boolean
  accommodation?: boolean
}

type Accommodation = {
  name: string
  location?: string
  description?: string
  type?: string
  distance?: string
  pricePerNight?: string
}

type ItineraryPeriod = {
  dayRange: string
  location?: string
  title?: string
  description?: string
}

type PackageData = {
  arrivalDate: any
  flexibleDates: any
  inclusions: boolean
  exclusions: boolean
  id: string
  title: string
  type?: string
  agencyId?: string
  agencyName?: string
  price?: number
  duration?: number
  location?: string
  destination?: string
  description?: string
  imageUrl?: string
  groupSize?: number
  departureDate?: any
  startDate?: any
  returnDate?: any
  endDate?: any
  services?: PackageService
  accommodations?: Accommodation[]
  itinerary?: ItineraryPeriod[]
}

type Agency = {
  id: string
  agencyName?: string
  verified?: boolean
  cityOfOperation?: string
  countryOfOperation?: string
  phoneNumber?: string
  email?: string
}

type BookingData = {
  packageId: string
  packageTitle?: string
  packageType?: string
  agencyId?: string
  agencyName?: string
  userId?: string
  userEmail?: string
  userName?: string
  userPhone?: string
  passportNumber?: string
  totalPrice?: number
  status?: string
  paymentStatus?: string
  paymentReference?: string
  createdAt?: Date
  departureDate?: any
  returnDate?: any
  duration?: number
  location?: string
}

const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1374113424342253639/nKKL1zQU7rQpDFuFP0vwoEIKLmvbShsYbQWWSg-cMkwag6qZtXHiBvnuBU5ObRli1hbt" // Replace with your Discord webhook URL

async function sendDiscordWebhook({
  user,
  status,
  reference,
  amount,
  packageId,
  packageTitle,
}: {
  user: any
  status: string
  reference: string
  amount: number
  packageId: string
  packageTitle: string
}) {
  const username = user?.displayName || user?.email || "Guest"
  const email = user?.email || "N/A"
  const content = `💸 **Payment Notification**
**Status:** ${status}
**User:** ${username}
**Email:** ${email}
**Package ID:** ${packageId}
**Package Title:** ${packageTitle}
**Amount:** ₦${(amount / 100).toLocaleString()}
**Reference:** ${reference}`

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
  } catch (err) {
    console.error("Failed to send Discord webhook:", err)
  }
}

export default function PackageDetailsPage() {
  const params = useParams()
  const id =
    params && typeof params.id === "string"
      ? params.id
      : params && Array.isArray(params.id)
        ? params.id[0]
        : ""
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState("")
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [userName, setUserName] = useState(user?.displayName || "")
  const [passportNumber, setPassportNumber] = useState(user?.passportNumber || "")
  const [userEmail, setUserEmail] = useState(user?.email || "")
  const [detailsConfirmed, setDetailsConfirmed] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const paystackBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true)
        const packageRef = doc(db, "packages", id)
        const packageSnap = await getDoc(packageRef)

        if (packageSnap.exists()) {
          const data = { id: packageSnap.id, ...(packageSnap.data() as Omit<PackageData, "id">) } as PackageData
          setPackageData(data)

          // Fetch agency data if agencyId exists
          if (data.agencyId) {
            const agencyData = await getAgencyById(data.agencyId)
            setAgency(agencyData)
          }
        } else {
          router.push("/404")
        }
      } catch (error) {
        console.error("Error fetching package:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPackageData()
    }
  }, [id, router])

  useEffect(() => {
    setUserName(userProfile?.displayName || user?.displayName || "")
    setPassportNumber(userProfile?.passportNumber || "")
    setUserEmail(userProfile?.email || user?.email || "")
  }, [userProfile, user])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUserProfile(userSnap.data())
        }
      }
    }
    fetchUserProfile()
  }, [user])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: packageData?.title || "Hajj/Umrah Package",
          text: `Check out this ${packageData?.type || "Hajj/Umrah"} package on Mutamir!`,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link copied",
          description: "Package link copied to clipboard!",
        })
      }
    }
  }

  const publicKey = "pk_live_160eeba29aa4385ec5888315c289e2379b7ef531" // Replace with your Paystack public key

  // Amount in kobo (for NGN)
  const amount = (packageData?.price || 0) * 100

  const paystackProps = {
    email: user?.email || "guest@mutamir.com",
    amount: amount, // Total amount in kobo
    currency: "NGN",
    reference: new Date().getTime().toString(), // Unique reference for the transaction
    metadata: {
      custom_fields: [
      {
        display_name: "Package ID",
        variable_name: "package_id",
        value: id,
      },
      {
        display_name: "Package Title",
        variable_name: "package_title",
        value: packageData?.title || "Hajj/Umrah Package",
      },
      {
        display_name: "User ID",
        variable_name: "user_id",
        value: user?.uid || "guest",
      },
      ],
    },
    publicKey,
    text: isBookingLoading ? "Processing..." : "Pay & Book Now",
    onSuccess: async (reference: { reference: string }) => {
      // Payment successful, create booking
      try {
      setIsBookingLoading(true);
      // Send Discord webhook
      await sendDiscordWebhook({
        user,
        status: "paid",
        reference: reference.reference,
        amount: amount,
        packageId: id,
        packageTitle: packageData?.title || "Hajj/Umrah Package",
      });

      // Save client info to Firestore
      const bookingData: BookingData = {
        packageId: id,
        packageTitle: packageData?.title,
        paymentStatus: "paid",
        paymentReference: reference?.reference,
        userId: user?.uid || "", // <-- Ensure this is present
        userName,
        userEmail,
        userPhone: user?.phoneNumber || "",
        passportNumber,
        totalPrice: packageData?.price,
        // ...other fields as needed
      };
      const result = await createBooking(bookingData);
      if (result && result.id) {
        router.push(`/booking/${result.id}`);
      } else {
        throw new Error("Failed to create booking");
      }
      } catch (error) {
      toast({
        title: "Booking Error",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      });
      } finally {
      setIsBookingLoading(false);
      }
    },
    onClose: (): void => {
      toast({
        title: "Payment Cancelled",
        description: "You cancelled the payment process.",
        variant: "destructive",
      })
    },
  }

  const handleBookNow = async () => {
    if (!user) {
      router.push(`/auth/login?returnUrl=/packages/${id}`)
      return
    }

    try {
      setIsBookingLoading(true)
      if (!packageData) throw new Error("Package data not loaded")

      const bookingData = {
        packageId: id,
        packageTitle: packageData.title,
        packageType: packageData.type || "Umrah",
        agencyId: packageData.agencyId,
        agencyName: agency?.agencyName || packageData.agencyName || "",
        userId: user?.uid || "",
        userEmail,
        userName,
        userPhone: user?.phoneNumber || "",
        passportNumber,
        totalPrice: packageData.price,
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
        departureDate: packageData.departureDate || packageData.startDate,
        returnDate: packageData.arrivalDate || packageData.endDate || null, // <-- Store as arrivalDate
        duration: packageData.duration,
        location: packageData.location || packageData.destination || "Makkah & Madinah",
      }

      const result = await createBooking(bookingData)

      if (result && result.id) {
        // Send booking confirmation email
        await fetch("/api/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.email,
            subject: "Your Booking is Confirmed!",
            text: `Dear ${user.displayName || user.email},\n\nYour booking for ${packageData.title} is confirmed.\n\nThank you for choosing Al-mutamir!`,
            html: `<p>Dear ${user.displayName || user.email},</p><p>Your booking for <b>${packageData.title}</b> is confirmed.</p><p>Thank you for choosing <b>Al-mutamir</b>!</p>`,
          }),
        })

        router.push(`/booking/${result.id}`)
      } else {
        throw new Error("Failed to create booking")
      }
    } catch (error) {
      toast({
        title: "Booking Error",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBookingLoading(false)
    }
  }

  useEffect(() => {
    if (detailsConfirmed) {
      setTimeout(() => {
        // Try to find the Paystack button and click it
        const btn = document.querySelector('button[data-paystack="true"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100); // Give time for the button to render
    }
  }, [detailsConfirmed])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Defensive: If packageData is null after loading, show not found
  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Package Not Found</h2>
          <p className="text-gray-500 mb-4">The package you are looking for does not exist.</p>
          <Button asChild>
            <Link href="/standard-packages">Browse Packages</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Package Image */}
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden">
              {packageData?.imageUrl ? (
                <Image
                  src={packageData.imageUrl || "/placeholder.svg"}
                  alt={packageData.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white text-primary">{packageData?.type || "Package"}</Badge>
              </div>
            </div>

            {/* Package Details */}
            <div>
              <h1 className="text-3xl font-bold">{packageData?.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {packageData?.destination || packageData?.location || "Makkah & Madinah, Saudi Arabia"}
                </span>
              </div>
              <p className="mt-4 text-gray-700">{packageData?.description}</p>
            </div>

            {/* Package Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{packageData?.duration || "N/A"} days</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Departure Date</p>
                          <p className="font-medium">
                            {packageData?.flexibleDates
                              ? "Flexible"
                              : packageData?.departureDate
                                ? new Date(
                                    packageData.departureDate.seconds
                                      ? packageData.departureDate.seconds * 1000
                                      : packageData.departureDate,
                                  ).toLocaleDateString()
                                : packageData?.startDate
                                  ? new Date(
                                      packageData.startDate.seconds
                                        ? packageData.startDate.seconds * 1000
                                        : packageData.startDate,
                                    ).toLocaleDateString()
                                  : "Flexible"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Group Size</p>
                          <p className="font-medium">Max {packageData?.groupSize || "20"} pilgrims</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Destination</p>
                          <p className="font-medium">
                            {packageData?.destination || packageData?.location || "Makkah & Madinah, Saudi Arabia"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Included Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Inclusions */}
                    <div>
                      <h4 className="font-medium mb-2">Inclusions</h4>
                      {packageData?.inclusions && packageData.inclusions.length > 0 ? (
                        <ul className="space-y-2">
                          {packageData.inclusions.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-500">No included services listed for this package.</div>
                      )}
                    </div>
                    {/* Exclusions */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Exclusions</h4>
                      {packageData?.exclusions && packageData.exclusions.length > 0 ? (
                        <ul className="space-y-2">
                          {packageData.exclusions.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-500">No exclusions listed for this package.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Itinerary</CardTitle>
                    <CardDescription>Schedule of your journey by day ranges</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {packageData?.itinerary && packageData.itinerary.length > 0 ? (
                      <div className="space-y-6">
                        {packageData.itinerary.map((period, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4 pb-2">
                            <h3 className="font-semibold text-lg">
                              Days {period.dayRange}
                              {period.location && (
                                <span className="text-muted-foreground ml-2">({period.location})</span>
                              )}
                            </h3>
                            <h4 className="font-medium mt-1">{period.title}</h4>
                            {period.description && <p className="text-gray-700 mt-1">{period.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">Detailed itinerary not available</h3>
                        <p className="text-gray-500 mt-2">
                          Please contact the agency for a detailed day-by-day itinerary.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accommodations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Accommodation Options</CardTitle>
                    <CardDescription>Places you'll stay during your journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {packageData?.accommodations && packageData.accommodations.length > 0 ? (
                      <div className="space-y-6">
                        {packageData.accommodations.map((accommodation, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold">{accommodation.name}</h3>
                              <Badge variant="outline">{accommodation.location || "Makkah/Madinah"}</Badge>
                            </div>
                            <p className="text-gray-600 mt-2">{accommodation.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  {accommodation.type || "Hotel"} • {accommodation.distance || "Near Haram"}
                                </span>
                              </div>
                              <span className="font-medium">
                                {accommodation.pricePerNight
                                  ? `₦${Number.parseInt(accommodation.pricePerNight).toLocaleString()} per night`
                                  : "Included in package"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">Accommodation details not available</h3>
                        <p className="text-gray-500 mt-2">
                          Please contact the agency for detailed accommodation information.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Package Price</CardTitle>
                <CardDescription>
                  Book this package now
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-bold text-xl">₦{packageData?.price?.toLocaleString() || "0"}</span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Included Services:</h4>
                  {packageData?.inclusions && packageData.inclusions.length > 0 ? (
                    <ul className="space-y-2">
                      {packageData.inclusions.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No included services listed for this package.</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                {!user ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Book Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sign in to book this package</DialogTitle>
                        <DialogDescription>
                          You need to be signed in to book this package. Please sign in or create an account to
                          continue.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col space-y-4 mt-4">
                        <Button asChild>
                          <Link href={`/auth/login?returnUrl=/packages/${id}`}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/auth/register?returnUrl=/packages/${id}`}>Create Account</Link>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <>
                    {!detailsConfirmed ? (
                      <>
                        <Button
                          className="w-full btn btn-primary"
                          onClick={() => setShowDetailsModal(true)}
                          disabled={isBookingLoading}
                        >
                          Book Now
                        </Button>
                        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Confirm Your Details</DialogTitle>
                              <DialogDescription>
                                Please confirm or update your details before payment.
                              </DialogDescription>
                            </DialogHeader>
                            {/* Compact Booking Details Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-semibold mb-1">Package</h4>
                                <div className="text-sm">{packageData?.title || "N/A"}</div>
                                <div className="text-xs text-gray-500">{packageData?.type || "N/A"}</div>
                                <div className="text-xs text-gray-500">{agency?.agencyName || "N/A"}</div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Travel</h4>
                                <div className="text-sm">
                                  <span className="font-medium">Departure:</span>{" "}
                                  {packageData?.flexibleDates
                                    ? "Flexible"
                                    : packageData?.departureDate
                                      ? new Date(
                                          packageData.departureDate.seconds
                                            ? packageData.departureDate.seconds * 1000
                                            : packageData.departureDate,
                                        ).toLocaleDateString()
                                      : packageData?.startDate
                                        ? new Date(
                                            packageData.startDate.seconds
                                              ? packageData.startDate.seconds * 1000
                                              : packageData.startDate,
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </div>
                                {/* Return date removed */}
                                <div className="text-sm">
                                  <span className="font-medium">Duration:</span> {packageData?.duration ? `${packageData.duration} days` : "N/A"}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Location:</span> {packageData?.location || packageData?.destination || "Makkah & Madinah"}
                                </div>
                              </div>
                            </div>
                            {/* User Details */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium mb-1" htmlFor="fullName">
                                  Full Name
                                </label>
                                <input
                                  id="fullName"
                                  type="text"
                                  className="w-full border rounded px-3 py-2"
                                  value={userName}
                                  onChange={e => setUserName(e.target.value)}
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1" htmlFor="passportNumber">
                                  Passport Number
                                </label>
                                <input
                                  id="passportNumber"
                                  type="text"
                                  className="w-full border rounded px-3 py-2"
                                  value={passportNumber}
                                  onChange={e => setPassportNumber(e.target.value)}
                                  placeholder="Enter your passport number"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1" htmlFor="email">
                                  Email Address
                                </label>
                                <input
                                  id="email"
                                  type="email"
                                  className="w-full border rounded px-3 py-2"
                                  value={userEmail}
                                  onChange={e => setUserEmail(e.target.value)}
                                  placeholder="Enter your email"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                className="flex-1"
                                onClick={() => {
                                  setDetailsConfirmed(true)
                                  setShowDetailsModal(false)
                                }}
                              >
                                Confirm Details
                              </Button>
                              <DialogClose asChild>
                                <Button variant="outline" className="flex-1">
                                  Cancel
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Button className="w-full btn btn-primary" asChild disabled={isBookingLoading}>
                        <PaystackButton {...paystackProps} />
                      </Button>
                    )}
                  </>
                )}
                <p className="text-xs text-gray-500 text-center">
                  By booking, you agree to our terms and conditions. Cancellation policy applies.
                </p>
              </CardFooter>
            </Card>

            {/* Agency Card */}
            {agency && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Agency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{agency.agencyName || "Unknown Agency"}</h3>
                      <p className="text-sm text-gray-500">{agency.verified ? "Verified Agency" : "Agency"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {agency.cityOfOperation}, {agency.countryOfOperation}
                      </span>
                    </div>
                    {agency.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{agency.phoneNumber}</span>
                      </div>
                    )}
                    {agency.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{agency.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/agency/${agency.id}`)}>
                    View Agency Profile
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
      {detailsConfirmed && (
  <div className="flex justify-center items-center py-4">
    <Loader2 className="animate-spin h-6 w-6 text-primary" />
    <span className="ml-2">Redirecting to payment...</span>
  </div>
)}
    </div>
  )
}
