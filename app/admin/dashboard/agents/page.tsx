"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Package,
  Calendar,
  BarChart3,
  Building2,
  LogOut,
  Settings,
  Shield,
  Search,
  Check,
  X,
  ExternalLink,
  Eye,
} from "lucide-react"
import { getAgencies, updateAgencyVerification } from "@/lib/firebase/admin"
import AdminProtectedRoute from "@/components/admin-protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function AdminAgentsPage() {
  const [loading, setLoading] = useState(true)
  const [agencies, setAgencies] = useState<any[]>([])
  const [filteredAgencies, setFilteredAgencies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgency, setSelectedAgency] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true)
        const allAgencies = await getAgencies()
        setAgencies(allAgencies)
        setFilteredAgencies(allAgencies)
      } catch (error) {
        console.error("Error fetching agencies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgencies()
  }, [])

  useEffect(() => {
    // Filter agencies based on search term
    if (searchTerm) {
      const filtered = agencies.filter(
        (agency) =>
          agency.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredAgencies(filtered)
    } else {
      setFilteredAgencies(agencies)
    }
  }, [searchTerm, agencies])

  const handleLogout = () => {
    localStorage.removeItem("admin-token")
    router.push("/auth/login")
  }

  const handleViewAgency = (agency: any) => {
    setSelectedAgency(agency)
    setIsViewDialogOpen(true)
  }

  const handleVerifyAgency = async (agencyId: string, verified: boolean) => {
    try {
      await updateAgencyVerification(agencyId, verified)

      // Update local state
      setAgencies((prevAgencies) =>
        prevAgencies.map((agency) => (agency.uid === agencyId ? { ...agency, verified } : agency)),
      )

      toast({
        title: verified ? "Agency verified" : "Agency unverified",
        description: `The agency has been ${verified ? "verified" : "unverified"} successfully.`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${verified ? "verify" : "unverify"} agency`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6 text-primary" />
              Admin Panel
            </h2>
          </div>
          <nav className="mt-6">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Main</div>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/users")}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left bg-gray-100"
              onClick={() => router.push("/admin/dashboard/agents")}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Agencies
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/packages")}
            >
              <Package className="mr-2 h-5 w-5" />
              Packages
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/bookings")}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Bookings
            </Button>

            <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase">Settings</div>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/settings")}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start px-4 py-2 text-left" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Agency Management</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search agencies..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Agencies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Agencies</CardTitle>
              <CardDescription>Verify and manage agencies on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-gray-100 p-4 font-medium">
                  <div>Agency Name</div>
                  <div>Contact</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredAgencies.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No agencies found</div>
                  ) : (
                    filteredAgencies.map((agency) => (
                      <div key={agency.uid} className="grid grid-cols-5 p-4 items-center">
                        <div className="font-medium">{agency.agencyName || agency.displayName || "Unnamed Agency"}</div>
                        <div className="text-sm">
                          <div>{agency.email}</div>
                          <div className="text-muted-foreground">{agency.phoneNumber || "No phone"}</div>
                        </div>
                        <div className="text-sm">
                          {agency.countryOfOperation && agency.cityOfOperation ? (
                            <span>
                              {agency.cityOfOperation}, {agency.countryOfOperation}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Location not set</span>
                          )}
                        </div>
                        <div>
                          <Badge variant={agency.verified ? "default" : "secondary"}>
                            {agency.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewAgency(agency)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {agency.verified ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleVerifyAgency(agency.uid, false)}
                            >
                              <X className="h-4 w-4 mr-1" /> Unverify
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleVerifyAgency(agency.uid, true)}>
                              <Check className="h-4 w-4 mr-1" /> Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Agency Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Agency Details</DialogTitle>
                <DialogDescription>Detailed information about the agency</DialogDescription>
              </DialogHeader>
              {selectedAgency && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Agency Name</p>
                        <p className="font-medium">{selectedAgency.agencyName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Manager Name</p>
                        <p>{selectedAgency.managerName || selectedAgency.displayName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{selectedAgency.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p>{selectedAgency.phoneNumber || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Alternative Email</p>
                        <p>{selectedAgency.alternativeEmail || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Country of Operation</p>
                        <p>{selectedAgency.countryOfOperation || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">City of Operation</p>
                        <p>{selectedAgency.cityOfOperation || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Pilgrims Per Year</p>
                        <p>{selectedAgency.averagePilgrimsPerYear || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Services Offered</p>
                        <p>
                          {selectedAgency.servicesOffered
                            ? Object.keys(selectedAgency.servicesOffered).join(", ")
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verification Status</p>
                        <Badge variant={selectedAgency.verified ? "default" : "secondary"}>
                          {selectedAgency.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/agency/profile?uid=${selectedAgency.uid}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>
                <div className="space-x-2">
                  {selectedAgency?.verified ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleVerifyAgency(selectedAgency.uid, false)
                        setIsViewDialogOpen(false)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" /> Unverify
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => {
                        handleVerifyAgency(selectedAgency.uid, true)
                        setIsViewDialogOpen(false)
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" /> Verify
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
