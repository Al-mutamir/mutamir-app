"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { getAgencyById as fetchAgencyById, getPackagesByAgency, getBookingsByPackageId } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import {
  BuildingIcon,
  Calendar,
  CheckCircle2,
  Globe,
  MapPin,
  Package,
  Phone,
  Mail,
  XCircle,
  Clock,
  Users,
  Star,
  Award,
  Briefcase,
  Share2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AgencyPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const router = useRouter()
  const { user } = useAuth()
  const [agency, setAgency] = useState<Agency | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState("")
  const [pilgrimsServed, setPilgrimsServed] = useState(0)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    // Set the share URL once the component mounts
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const agencyData = await fetchAgencyById(id!)
      if (!agencyData) return
      setAgency(agencyData)

      const agencyPackages = await getPackagesByAgency(id!)
      const activePackages = agencyPackages.filter((pkg) => pkg.status === "active")
      setPackages(activePackages)

      // Fetch bookings for each package directly from Firestore
      let allBookings: any[] = []
      for (const pkg of agencyPackages) {
        const bookingsForPackage = await getBookingsByPackageId(pkg.id)
        allBookings = allBookings.concat(bookingsForPackage)
      }
      setBookings(allBookings)
      setLoading(false)
    }
    if (id) fetchData()
  }, [id, router])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${agency?.agencyName || agency?.displayName || "Agency"} - Mutamir`,
          text: `Check out ${agency?.agencyName || agency?.displayName || "this agency"} on Mutamir for Hajj and Umrah packages!`,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard!")
    }
  }

  interface Agency {
    id?: string
    agencyName?: string
    displayName?: string
    verified?: boolean
    cityOfOperation?: string
    countryOfOperation?: string
    description?: string
    address?: string
    phoneNumber?: string
    alternativeEmail?: string
    email?: string
    yearsInOperation?: number | string
    pilgrimsServed?: number | string
    averagePilgrimsPerYear?: number | string
    rating?: number | string
    servicesOffered?: {
      [key: string]: boolean
    }
    additionalServices?: string
    certifications?: string
    businessHours?: string
  }

  interface Package {
    id: string
    title: string
    description?: string
    imageUrl?: string
    type?: string
    price?: number
    duration?: number | string
    departureDate?: { seconds?: number } | number | string
    status?: string
  }

  const handleBookNow = (packageId: string) => {
    if (!user) {
      // If user is not logged in, redirect to login page with return URL
      router.push(`/auth/login?returnUrl=/packages/${packageId}`)
    } else {
      // If user is logged in, go directly to the package page
      router.push(`/packages/${packageId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-6xl mx-auto py-12 px-4">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 gap-8">
          {/* Agency Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white p-6 rounded-lg shadow-sm flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {agency?.agencyName || agency?.displayName || "Agency"}
                    {agency?.verified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 ml-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 ml-2 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Unverified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-gray-500 mt-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {agency?.cityOfOperation}, {agency?.countryOfOperation}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">About Us</h2>
                <p className="text-gray-700">
                  {agency?.description || "This agency has not provided a description yet."}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <BuildingIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Office Address</h3>
                    <p className="text-sm text-gray-600">
                      {agency?.address || `${agency?.cityOfOperation}, ${agency?.countryOfOperation}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Contact Phone</h3>
                    <p className="text-sm text-gray-600">{agency?.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-600">
                      {agency?.alternativeEmail || agency?.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agency Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Packages</p>
                    <h3 className="text-2xl font-bold">{packages.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Years in Operation</p>
                    <h3 className="text-2xl font-bold">{agency?.yearsInOperation || "N/A"}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pilgrims Served</p>
                    <h3 className="text-2xl font-bold">{bookings.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience Rating</p>
                    <h3 className="text-2xl font-bold">{agency?.rating || "New"}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agency Content Tabs */}
          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="packages">Our Packages</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="about">About Us</TabsTrigger>
            </TabsList>

            {/* Packages Tab */}
            <TabsContent value="packages" className="mt-6">
              {packages.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-lg shadow-sm">
                  <Package className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No packages available</h3>
                  <p className="text-gray-500 mt-2">This agency has not published any packages yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} className="overflow-hidden transition-all hover:shadow-md">
                      {pkg.imageUrl ? (
                        <div className="relative h-48 w-full">
                          <Image
                            src={pkg.imageUrl || "/placeholder.svg?height=192&width=384"}
                            alt={pkg.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{pkg.title}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            {pkg.type || "Package"}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="font-medium">₦{pkg.price?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Duration:</span>
                            <span>{pkg.duration} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Departure:</span>
                            <span>
                              {pkg.departureDate
                                ? new Date(
                                    typeof pkg.departureDate === "object" && pkg.departureDate !== null && "seconds" in pkg.departureDate
                                      ? (pkg.departureDate.seconds as number) * 1000
                                      : pkg.departureDate as string | number
                                  ).toLocaleDateString()
                                : "Flexible"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => handleBookNow(pkg.id)}>
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Our Services</CardTitle>
                  <CardDescription>
                    We provide comprehensive services for Hajj and Umrah pilgrims
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agency?.servicesOffered && Object.keys(agency.servicesOffered).length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(agency.servicesOffered).map(([service, offered], idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          {offered ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <span className={`text-base ${offered ? "" : "line-through text-gray-400"}`}>
                            {service}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No services listed.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {agency?.agencyName || agency?.displayName || "Us"}</CardTitle>
                  <CardDescription>Learn more about our agency and our mission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Our Story</h3>
                    <p className="text-gray-600">
                      {agency?.description && agency.description.trim().length > 0
                        ? agency.description
                        : "Agency hasn't added an about us detail."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Our Experience</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>
                          <span className="font-medium">Years in Business:</span>{" "}
                          {agency?.yearsInOperation || "New"}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <span>
                          <span className="font-medium">Pilgrims Served:</span>{" "}
                          {bookings.length}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <span>
                          <span className="font-medium">Packages Offered:</span>{" "}
                          {packages.length}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {agency?.certifications && (
                    <div>
                      <h3 className="font-medium text-lg mb-2">Certifications & Licenses</h3>
                      <p className="text-gray-600">{agency.certifications}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-lg mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <BuildingIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Office Address</h4>
                          <p className="text-gray-600">
                            {agency?.address || `${agency?.cityOfOperation}, ${agency?.countryOfOperation}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Phone Number</h4>
                          <p className="text-gray-600">{agency?.phoneNumber || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Email Address</h4>
                          <p className="text-gray-600">{agency?.alternativeEmail || agency?.email || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Business Hours</h4>
                          <p className="text-gray-600">{agency?.businessHours || "Monday-Friday: 9am-5pm"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}



export const getAgencyById = async (agencyId: string) => {
  try {
    const agencyDoc = await getDoc(doc(db!, "users", agencyId))
    if (!agencyDoc.exists()) {
      return null
    }
    return { id: agencyDoc.id, ...agencyDoc.data() }
  } catch (error) {
    console.error("Error getting agency by ID:", error)
    return null
  }
}


