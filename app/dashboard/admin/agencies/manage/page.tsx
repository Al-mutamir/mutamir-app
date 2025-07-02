"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
// Assuming getAgencies and updateAgencyVerification are client-callable or wrapped in API routes
import { getAgencies, updateAgencyVerification } from "@/lib/firebase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, ExternalLink, MapPin, Package, Search, Users, XCircle, Building2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard-layout"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { getPackagesByAgency } from "@/lib/firebase/firestore"

// 1. Define the Agency interface based on the data structure
// This interface describes the shape of each agency object in your array.
export interface Agency {
  uid: string; // Assuming 'uid' is the unique identifier for the agency document
  agencyName: string;
  displayName?: string; // Optional, as it might not always be present or might be redundant with agencyName
  email: string;
  phoneNumber?: string; // Made optional as per typical data structures
  cityOfOperation?: string; // Made optional
  countryOfOperation?: string; // Made optional
  verified: boolean;
  createdAt?: Date | { seconds: number; nanoseconds: number }; // Can be Date or Firestore Timestamp object
  // Add any other properties that an agency object might have
  address?: string;
  stateOfOperation?: string;
  description?: string;
  website?: string;
  yearsInOperation?: number; // Assuming this is a number in the database
  servicesOffered?: string[];
  pilgrimsServed?: number; // Assuming this is a number in the database
  role?: string; // e.g., "agency"
  onboardingCompleted?: boolean;
}

// Define a type for the agency packages cache
interface AgencyPackagesCache {
  [agencyId: string]: any[]; // Maps agencyId to an array of packages (can be more specific if Package type is defined)
}


export default function ManageAgenciesPage() {
  const router = useRouter()
  const { toast } = useToast()
  // 2. Explicitly type the 'agencies' state to be an array of 'Agency' objects
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]) // Also type filteredAgencies
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("all")

  // Agency packages cache to avoid repeated fetching - explicitly type it
  const [agencyPackagesCache, setAgencyPackagesCache] = useState<AgencyPackagesCache>({})

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true)
        // getAgencies should return Promise<Agency[]>
        const agenciesData: Agency[] = await getAgencies() // Ensure getAgencies returns Agency[]
        setAgencies(agenciesData)
        setFilteredAgencies(agenciesData)
      } catch (error) {
        console.error("Error fetching agencies:", error)
        toast({
          title: "Error",
          description: "Failed to load agencies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAgencies()
  }, [toast])

  // Filter agencies when search query or verification filter changes
  useEffect(() => {
    let filtered = [...agencies]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (agency) =>
          (agency.agencyName?.toLowerCase() || "").includes(query) ||
          (agency.email?.toLowerCase() || "").includes(query) ||
          (agency.displayName?.toLowerCase() || "").includes(query) ||
          (agency.cityOfOperation?.toLowerCase() || "").includes(query) ||
          (agency.countryOfOperation?.toLowerCase() || "").includes(query),
      )
    }

    // Apply verification filter
    if (verificationFilter !== "all") {
      const isVerified = verificationFilter === "verified"
      filtered = filtered.filter((agency) => agency.verified === isVerified)
    }

    setFilteredAgencies(filtered)
  }, [searchQuery, verificationFilter, agencies])

  const handleVerificationToggle = async (agencyId: string, currentVerificationStatus: boolean) => {
    try {
      setLoading(true)
      await updateAgencyVerification(agencyId, !currentVerificationStatus)

      // Update local state immutably
      setAgencies((prevAgencies) =>
        prevAgencies.map((agency) =>
          agency.uid === agencyId ? { ...agency, verified: !currentVerificationStatus } : agency,
        ),
      )

      toast({
        title: `Agency ${!currentVerificationStatus ? "Verified" : "Unverified"}`,
        description: `Agency has been ${!currentVerificationStatus ? "verified" : "unverified"} successfully.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating agency verification:", error)
      toast({
        title: "Error",
        description: "Failed to update agency verification status.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAgencyPackages = async (agencyId: string) => {
    // If we already have the packages in cache, don't fetch again
    if (agencyPackagesCache[agencyId]) {
      return agencyPackagesCache[agencyId].length
    }

    try {
      const packages = await getPackagesByAgency(agencyId)

      // Update cache
      setAgencyPackagesCache((prev) => ({
        ...prev,
        [agencyId]: packages,
      }))

      return packages.length
    } catch (error) {
      console.error(`Error fetching packages for agency ${agencyId}:`, error)
      return 0
    }
  }

  if (loading && agencies.length === 0) {
    return (
      <ProtectedRoute allowedRoles={["admin"]} requiredRole="admin">
        <DashboardLayout userType="admin">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Agency Management</h1>
                <p className="text-muted-foreground">Manage and verify travel agencies</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]} requiredRole="admin">
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Agency Management</h1>
              <p className="text-muted-foreground">Manage and verify travel agencies</p>
            </div>
            <Link href="/dashboard/admin/agencies/create">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Create Agency
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Agencies</p>
                    <h3 className="text-2xl font-bold">{agencies.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Verified Agencies</p>
                    <h3 className="text-2xl font-bold">{agencies.filter((agency) => agency.verified).length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <XCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Verification</p>
                    <h3 className="text-2xl font-bold">{agencies.filter((agency) => !agency.verified).length}</h3>
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
                placeholder="Search agencies by name, email, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full md:w-auto px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
              >
                <option value="all">All Agencies</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>

          {/* Agency Listings */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="mt-6">
              {filteredAgencies.length === 0 ? (
                <div className="text-center p-12 border rounded-lg">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No agencies found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || verificationFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No agencies have registered yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgencies.map((agency) => {
                    // This is an async function call inside render, which is generally not ideal
                    // for direct display as it won't await.
                    // The `agencyPackagesCache` helps, but the initial "Loading" might flicker.
                    // For a more robust solution, consider pre-fetching counts or using SWR/React Query.
                    const packagesCount = agencyPackagesCache[agency.uid]?.length || "Loading"; // Access from cache

                    // Call fetchAgencyPackages as a side effect if not in cache
                    useEffect(() => {
                      if (!agencyPackagesCache[agency.uid]) {
                        fetchAgencyPackages(agency.uid);
                      }
                    }, [agency.uid, agencyPackagesCache]); // Depend on agency.uid and cache

                    return (
                      <Card key={agency.uid} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {agency.agencyName || agency.displayName || "Unnamed Agency"}
                            </CardTitle>
                            {agency.verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Unverified
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{agency.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm">
                                {agency.cityOfOperation}, {agency.countryOfOperation}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm">
                                {packagesCount} packages
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm">
                                {agency.pilgrimsServed || "Unknown"} pilgrims/year
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2 pt-2 border-t">
                          <Link href={`/agency/${agency.uid}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" /> View Page
                            </Button>
                          </Link>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={agency.verified ? "text-amber-600" : "text-green-600"}
                              onClick={() => handleVerificationToggle(agency.uid, agency.verified)}
                            >
                              {agency.verified ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" /> Unverify
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/admin/agencies/edit/${agency.uid}`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              {filteredAgencies.length === 0 ? (
                <div className="text-center p-12 border rounded-lg">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No agencies found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || verificationFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No agencies have registered yet"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Agency</th>
                        <th className="text-left p-3 font-medium">Location</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Packages</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgencies.map((agency, index) => {
                        const packagesCount = agencyPackagesCache[agency.uid]?.length || "Loading";

                        useEffect(() => {
                          if (!agencyPackagesCache[agency.uid]) {
                            fetchAgencyPackages(agency.uid);
                          }
                        }, [agency.uid, agencyPackagesCache]);

                        return (
                          <tr key={agency.uid} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                            <td className="p-3">
                              <div className="font-medium">
                                {agency.agencyName || agency.displayName || "Unnamed Agency"}
                              </div>
                              <div className="text-sm text-muted-foreground">{agency.email}</div>
                            </td>
                            <td className="p-3">
                              {agency.cityOfOperation}, {agency.countryOfOperation}
                            </td>
                            <td className="p-3">
                              {agency.verified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                  <XCircle className="h-3.5 w-3.5 mr-1" /> Unverified
                                </Badge>
                              )}
                            </td>
                            <td className="p-3">{packagesCount}</td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/agency/${agency.uid}`} target="_blank">
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={agency.verified ? "text-amber-600" : "text-green-600"}
                                  onClick={() => handleVerificationToggle(agency.uid, agency.verified)}
                                >
                                  {agency.verified ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/admin/agencies/edit/${agency.uid}`)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
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
