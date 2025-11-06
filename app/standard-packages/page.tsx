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
import { formatCurrency, parseDate, formatDate } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChevronDown, Filter } from "lucide-react"

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
  status?: string
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
  const [allPackages, setAllPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState({
    price: "",
    date: "",
  })

  // Price ranges in millions
  const priceRanges = [
    { label: "All", value: "" },
    { label: "₦1m - ₦2m", value: "1-2" },
    { label: "₦2m - ₦3m", value: "2-3" },
    { label: "₦3m - ₦4m", value: "3-4" },
    { label: "₦4m+", value: "4+" },
  ]

  // Filter logic
  const filterPackages = (pkgs: Package[]) => {
    let filtered = [...pkgs]
    // Only show packages with status 'active' (published)
    filtered = filtered.filter(pkg => pkg.status === "active" || !pkg.status)
    // Price filter
    if (filter.price) {
      filtered = filtered.filter(pkg => {
        if (!pkg.price) return false
        const price = pkg.price / 1_000_000
        if (filter.price === "4+") return price >= 4
        const [min, max] = filter.price.split("-").map(Number)
        return price >= min && price < max
      })
    }
    // Date filter
    if (filter.date) {
      filtered = filtered.filter(pkg => {
        if (!pkg.departureDate) return false
        if (typeof pkg.departureDate === "string" && pkg.departureDate.toLowerCase() === "flexible") {
          return filter.date === "flexible"
        }
        if (filter.date === "flexible") {
          return typeof pkg.departureDate === "string" && pkg.departureDate.toLowerCase() === "flexible"
        }
        // Try to parse date
        const pkgDate = parseDate(pkg.departureDate)
        if (!pkgDate) return false
        // Compare only date part
        const filterDate = new Date(filter.date)
        return (
          pkgDate.getFullYear() === filterDate.getFullYear() &&
          pkgDate.getMonth() === filterDate.getMonth() &&
          pkgDate.getDate() === filterDate.getDate()
        )
      })
    }
    return filtered
  }

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError(null)
        const packages = await getAllPackages()
        setAllPackages(packages)
      } catch (err) {
        setError("Failed to load packages. Please try again later.")
        setAllPackages([])
      } finally {
        setLoading(false)
      }
    }
    fetchPackages()
  }, [])

  const formatDateSafe = (date?: any): string => {
    if (!date) return "TBA"
    if (typeof date === "string" && date.toLowerCase() === "flexible") return "Flexible"
    return formatDate(date, "MMM d, yyyy")
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
        {/* Always show agency name if available */}
        {"agencyName" in pkg && pkg.agencyName && (
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
          {pkg.destination || "Saudi Arabia"}
        </CardDescription>
        {/* Always show agency name under title if available */}
        {"agencyName" in pkg && pkg.agencyName && (
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

  const hasAnyPackages = allPackages.length > 0

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Hajj & Umrah Packages</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive collection of Hajj and Umrah packages. Choose from Hajj or Umrah options below.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8">
        <button
          className="flex items-center gap-2 px-4 py-2 border rounded bg-white text-[#014034] hover:bg-[#F8F8F6]"
          onClick={() => setShowFilter(v => !v)}
          type="button"
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
        </button>
        {showFilter && (
          <div className="flex flex-wrap gap-4 items-center bg-[#F8F8F6] p-4 rounded-lg border border-[#E3B23C]/40 mt-4">
            {/* Price filter */}
            <div>
              <label className="block text-xs mb-1">Price Range</label>
              <select
                className="border rounded px-2 py-1"
                value={filter.price}
                onChange={e => setFilter(f => ({ ...f, price: e.target.value }))}
              >
                {priceRanges.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {/* Date filter */}
            <div>
              <label className="block text-xs mb-1">Departure Date</label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={filter.date !== "flexible" ? filter.date : ""}
                onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
                disabled={filter.date === "flexible"}
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="flexible"
                  checked={filter.date === "flexible"}
                  onChange={e =>
                    setFilter(f => ({
                      ...f,
                      date: e.target.checked ? "flexible" : "",
                    }))
                  }
                  className="accent-[#E3B23C]"
                />
                <label htmlFor="flexible" className="text-xs">Flexible Date</label>
              </div>
            </div>
            <button
              className="ml-auto text-xs underline text-[#007F5F]"
              onClick={() => setFilter({ price: "", date: "" })}
              type="button"
            >
              Reset Filters
            </button>
          </div>
        )}
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
          description="There are currently no published packages available. Please check back later or contact our support team for more information."
        />
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">All Published Packages</h2>
            <p className="text-gray-600">
              Browse all active packages published by Almutamir admin and agencies. Use filters to narrow your search.
            </p>
          </div>
          {filterPackages(allPackages).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filterPackages(allPackages).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} showAgency={true} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="h-12 w-12 text-gray-400 mx-auto" />}
              title="No Packages Available"
              description="There are currently no published packages available. Please check back later for our upcoming offerings."
            />
          )}
        </div>
      )}
    </div>
  )
}