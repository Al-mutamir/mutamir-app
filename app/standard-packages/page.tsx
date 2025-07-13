"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, ArrowRight, Package, Building, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getAllPackages, getAllUsers } from "@/lib/firebase/firestore"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Type definitions
interface User {
  id: string
  role: string
  agencyName?: string
  displayName?: string
  name?: string
  email: string
}

interface Package {
  id: string
  title?: string
  description?: string
  destination?: string
  duration?: string
  groupSize?: number
  price?: number
  type?: string
  imageUrl?: string
  departureDate?: string | Date | { toDate: () => Date }
  createdBy?: string
  isStandard?: boolean
  agencyId?: string
}

interface AgencyPackage extends Package {
  agencyName: string
}

interface PackagesState {
  standard: Package[]
  agency: AgencyPackage[]
}

interface PackageCardProps {
  pkg: Package | AgencyPackage
  showAgency?: boolean
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function StandardPackagesPage() {
  const [packages, setPackages] = useState<PackagesState>({
    standard: [],
    agency: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError(null) // Reset error state
        const [allPackages, allUsers] = await Promise.all([getAllPackages(), getAllUsers()])

        // Build a map of agencyId to agencyName
        const agencyMap: Record<string, string> = {}
        allUsers
          .filter((user: User) => user.role === "agency")
          .forEach((agency: User) => {
            agencyMap[agency.id] = agency.agencyName || agency.displayName || agency.name || agency.email || "Unknown Agency"
          })

        // Attach agencyName to each agency package
        const standardPackages: Package[] = allPackages.filter((pkg: Package) => pkg.createdBy === "admin" || pkg.isStandard)
        const agencyPackages: AgencyPackage[] = allPackages
          .filter((pkg: Package) => pkg.createdBy !== "admin" && !pkg.isStandard)
          .map((pkg: Package): AgencyPackage => ({
            ...pkg,
            agencyName: agencyMap[pkg.agencyId || ""] || "Unknown Agency",
          }))

        setPackages({
          standard: standardPackages,
          agency: agencyPackages,
        })
      } catch (err) {
        console.error("Error fetching packages:", err)
        setError("Failed to load packages. Please try again later.")
        setPackages({
          standard: [],
          agency: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const formatDate = (date?: string | Date | { toDate: () => Date }): string => {
    if (!date) return "TBA"

    try {
      if (typeof date === "string") {
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      if (date && typeof date === "object" && "toDate" in date) {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      if (date instanceof Date) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      return "TBA"
    } catch (error) {
      console.error("Date formatting error:", error)
      return "TBA"
    }
  }

  const PackageCard = ({ pkg, showAgency = false }: PackageCardProps) => (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={pkg.imageUrl || "/placeholder.svg?height=300&width=400"}
          alt={pkg.title || "Package image"}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform hover:scale-105 duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white text-primary">{pkg.type || "Package"}</Badge>
        </div>
        {showAgency && "agencyName" in pkg && pkg.agencyName && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Building className="h-3 w-3 mr-1" />
              {pkg.agencyName}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2">{pkg.title || "Untitled Package"}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-gray-500" />
          {pkg.destination || "Destination TBA"}
        </CardDescription>
        {/* Show agency name under title for agency packages */}
        {showAgency && "agencyName" in pkg && pkg.agencyName && (
          <div className="mt-1 text-xs text-blue-800 flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span>{pkg.agencyName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description || "No description available"}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{pkg.duration || "Duration TBA"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Max {pkg.groupSize || "TBA"}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <span>Departure: {formatDate(pkg.departureDate)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="font-bold text-lg">{formatCurrency(pkg.price || 0)}</div>
        <Button asChild size="sm">
          <Link href={`/packages/${pkg.id}`}>
            View Details <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
    <div className="text-center py-16 px-4 border border-dashed rounded-lg bg-gray-50">
      {icon}
      <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{description}</p>
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Hajj & Umrah Packages</h1>
          <p className="text-gray-600">Loading packages...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const hasAnyPackages = packages.standard.length > 0 || packages.agency.length > 0

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Hajj & Umrah Packages</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive collection of Hajj and Umrah packages. Choose from our standard Al-Mutamir packages
          or discover unique offerings from our verified agency partners.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!hasAnyPackages && !error ? (
        <EmptyState
          icon={<Package className="h-12 w-12 text-gray-400 mx-auto" />}
          title="No Packages Available"
          description="There are currently no published Hajj or Umrah packages available. Please check back later or contact our support team for more information."
        />
      ) : (
        <Tabs defaultValue="agency" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="agency" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Agency Packages ({packages.agency.length})
            </TabsTrigger>
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Standard Packages ({packages.standard.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agency">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Agency Partner Packages</h2>
              <p className="text-gray-600">
                Discover unique packages from our verified agency partners, each offering specialized services and
                experiences.
              </p>
            </div>

            {packages.agency.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.agency.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} showAgency={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Building className="h-12 w-12 text-gray-400 mx-auto" />}
                title="No Agency Packages Available"
                description="There are currently no packages published by our agency partners. Check back soon as our partners add their unique Hajj and Umrah offerings."
              />
            )}
          </TabsContent>

          <TabsContent value="standard">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Al-Mutamir Standard Packages</h2>
              <p className="text-gray-600">
                Our carefully curated standard packages offer excellent value and comprehensive services for your sacred
                journey.
              </p>
            </div>

            {packages.standard.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.standard.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} showAgency={false} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="h-12 w-12 text-gray-400 mx-auto" />}
                title="No Standard Packages Available"
                description="There are currently no standard packages published by Al-Mutamir. Please check back later for our upcoming Hajj and Umrah offerings."
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}