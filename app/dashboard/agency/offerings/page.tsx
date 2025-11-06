"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPackagesByAgency, getBookingsByAgency, deletePackage} from "@/lib/firebase/firestore"
import { Package as pkg, Booking } from "@/firebase/firestore"
import { Edit, Eye, Loader2, Package, Plus, Search, Users, Star, Share2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { formatDate, parseDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function AgencyOfferingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<pkg[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredPackages, setFilteredPackages] = useState<pkg[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [agencyPackages, agencyBookings] = await Promise.all([
          getPackagesByAgency(user.uid),
          getBookingsByAgency(user.uid),
        ])

        setPackages(agencyPackages)
        setFilteredPackages(agencyPackages)
        setBookings(agencyBookings)
      } catch (error) {
        console.error("Error fetching packages:", error)
        setError("Failed to load packages. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Filter packages based on search query and status filter
  useEffect(() => {
    if (!packages.length) return

    let filtered = [...packages]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (pkg) =>
          pkg.title?.toLowerCase().includes(query) ||
          pkg.description?.toLowerCase().includes(query) ||
          pkg.type?.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === filterStatus)
    }

    // Apply sorting
    filtered = sortPackages(filtered, sortBy)

    setFilteredPackages(filtered)
  }, [searchQuery, filterStatus, sortBy, packages])

  // Sort packages based on selected criteria
  const sortPackages = (packagesToSort: pkg[], sortCriteria: string) => {
    const sorted = [...packagesToSort]

    switch (sortCriteria) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? parseDate(a.createdAt) || new Date(0) : new Date(0)
          const dateB = b.createdAt ? parseDate(b.createdAt) || new Date(0) : new Date(0)
          return dateB.getTime() - dateA.getTime()
        })
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? parseDate(a.createdAt) || new Date(0) : new Date(0)
          const dateB = b.createdAt ? parseDate(b.createdAt) || new Date(0) : new Date(0)
          return dateA.getTime() - dateB.getTime()
        })
      case "priceHigh":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "priceLow":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "popular":
        return sorted.sort((a, b) => {
          const bookingsA = bookings.filter((booking) => booking.packageId === a.id).length
          const bookingsB = bookings.filter((booking) => booking.packageId === b.id).length
          return bookingsB - bookingsA
        })
      default:
        return sorted
    }
  }

  // Get booking count for a package
  const getBookingCount = (packageId: any) => {
    return bookings.filter((booking) => booking.packageId === packageId).length
  }

  // Handle package sharing
  const handleSharePackage = async (pkg:any) => {
    const shareUrl = `${window.location.origin}/packages/${pkg.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: pkg.title,
          text: `Check out this ${pkg.type} package: ${pkg.title}`,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Package link has been copied to clipboard",
      })
    }
  }

  // Handle package deletion
  const handleDeletePackage = async (packageId: any) => {
    if (confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      setDeletingId(packageId)
      try {
        await deletePackage(packageId)
        setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId))
        setFilteredPackages((prev) => prev.filter((pkg) => pkg.id !== packageId))
        toast({
          title: "Package Deleted",
          description: "The package has been successfully deleted.",
        })
      } catch (error) {
        console.error("Error deleting package:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete the package. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["agency"]}>
        <DashboardLayout userType="agency">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading your packages...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["agency"]}>
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

  return (
    <ProtectedRoute allowedRoles={["agency"]}>
      <DashboardLayout userType="agency" title="My Packages" description="Manage your Hajj and Umrah packages">
        <div className="space-y-6">
          <div className="flex justify-end">
            <Link href="/dashboard/agency/packages/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Package
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Packages</p>
                    <h3 className="text-2xl font-bold">{packages.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Packages</p>
                    <h3 className="text-2xl font-bold">{packages.filter((p) => p.status === "active").length}</h3>
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
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <h3 className="text-2xl font-bold">{bookings.length}</h3>
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
                placeholder="Search packages..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="popular">Most Booked</option>
            </select>
          </div>

          {/* Packages Grid */}
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPackages.length} of {packages.length} packages
              </p>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="w-full">
              {filteredPackages.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No packages found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first package to get started"}
                  </p>
                  {!searchQuery && filterStatus === "all" && (
                    <Link href="/dashboard/agency/packages/create">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Package
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => (
                    <Card key={pkg.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{pkg.title}</CardTitle>
                          <Badge
                            variant={pkg.status === "active" ? "default" : "secondary"}
                            className={
                              pkg.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {pkg.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-medium">₦{pkg.price?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Duration:</span>
                            <span>{pkg.duration} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Type:</span>
                            <span>{pkg.type || "Standard"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Bookings:</span>
                            <span>{getBookingCount(pkg.id)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Created:</span>
                            <span>
                              {pkg.createdAt ? formatDate(pkg.createdAt) : "Unknown"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-3 border-t">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/packages/${pkg.id}`)}
                            aria-label="View Package"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/agency/packages/edit/${pkg.id}`)}
                            aria-label="Edit Package"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSharePackage(pkg)}
                            aria-label="Share Package"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePackage(pkg.id)}
                            disabled={deletingId === pkg.id}
                            aria-label="Delete Package"
                          >
                            <XCircle className="h-4 w-4" />
                            {deletingId === pkg.id && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="w-full">
              {filteredPackages.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No packages found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first package to get started"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium">Package</th>
                        <th className="text-left p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Duration</th>
                        <th className="text-left p-3 font-medium">Bookings</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Created</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.map((pkg, index) => (
                        <tr key={pkg.id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-muted/30"}`}>
                          <td className="p-3">
                            <div className="font-medium">{pkg.title}</div>
                            <div className="text-sm text-muted-foreground">{pkg.type || "Standard"}</div>
                          </td>
                          <td className="p-3">₦{pkg.price?.toLocaleString()}</td>
                          <td className="p-3">{pkg.duration} days</td>
                          <td className="p-3">{getBookingCount(pkg.id)}</td>
                          <td className="p-3">
                            <Badge
                              variant={pkg.status === "active" ? "default" : "secondary"}
                              className={
                                pkg.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }
                            >
                              {pkg.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {pkg.createdAt ? formatDate(pkg.createdAt) : "Unknown"}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => router.push(`/packages/${pkg.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/agency/packages/edit/${pkg.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleSharePackage(pkg)}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePackage(pkg.id)}
                                disabled={deletingId === pkg.id}
                              >
                                {deletingId === pkg.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
