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
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react"
import { getPackages, deletePackage } from "@/lib/firebase/admin"
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

export default function AdminPackagesPage() {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<any[]>([])
  const [filteredPackages, setFilteredPackages] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const allPackages = await getPackages()
        setPackages(allPackages)
        setFilteredPackages(allPackages)
      } catch (error) {
        console.error("Error fetching packages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  useEffect(() => {
    // Filter packages based on search term
    if (searchTerm) {
      const filtered = packages.filter(
        (pkg) =>
          pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPackages(filtered)
    } else {
      setFilteredPackages(packages)
    }
  }, [searchTerm, packages])

  const handleLogout = () => {
    localStorage.removeItem("admin-token")
    router.push("/auth/login")
  }

  const handleViewPackage = (pkg: any) => {
    setSelectedPackage(pkg)
    setIsViewDialogOpen(true)
  }

  const handleEditPackage = (pkg: any) => {
    router.push(`/admin/dashboard/packages/edit/${pkg.id}`)
  }

  const handleDeletePackage = (pkg: any) => {
    setSelectedPackage(pkg)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePackage = async () => {
    try {
      await deletePackage(selectedPackage.id)

      // Update local state
      setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== selectedPackage.id))

      toast({
        title: "Package deleted",
        description: `${selectedPackage.title} has been deleted.`,
        variant: "default",
      })

      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
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
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => router.push("/admin/dashboard/agents")}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Agencies
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left bg-gray-100"
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Package Management</h1>
            <Button onClick={() => router.push("/admin/dashboard/packages/create")}>
              <Plus className="mr-2 h-5 w-5" />
              Create Package
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search packages..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Packages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Packages</CardTitle>
              <CardDescription>Manage all packages on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 bg-gray-100 p-4 font-medium">
                  <div className="col-span-2">Package</div>
                  <div>Agency</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredPackages.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No packages found</div>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <div key={pkg.id} className="grid grid-cols-6 p-4 items-center">
                        <div className="col-span-2">
                          <div className="font-medium">{pkg.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{pkg.description}</div>
                        </div>
                        <div className="text-sm">
                          {pkg.agencyName || (pkg.agencyId === "admin" ? "Almutamir" : pkg.agencyId)}
                        </div>
                        <div className="font-medium">₦{pkg.price?.toLocaleString()}</div>
                        <div>
                          <Badge
                            variant={
                              pkg.status === "active" ? "default" : pkg.status === "draft" ? "secondary" : "destructive"
                            }
                          >
                            {pkg.status?.charAt(0).toUpperCase() + pkg.status?.slice(1) || "Draft"}
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewPackage(pkg)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEditPackage(pkg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeletePackage(pkg)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Package Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Package Details</DialogTitle>
                <DialogDescription>Detailed information about the package</DialogDescription>
              </DialogHeader>
              {selectedPackage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-medium">{selectedPackage.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{selectedPackage.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">₦{selectedPackage.price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p>{selectedPackage.duration} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={
                            selectedPackage.status === "active"
                              ? "default"
                              : selectedPackage.status === "draft"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {selectedPackage.status?.charAt(0).toUpperCase() + selectedPackage.status?.slice(1) ||
                            "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Agency</p>
                        <p>
                          {selectedPackage.agencyName ||
                            (selectedPackage.agencyId === "admin" ? "Almutamir" : selectedPackage.agencyId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Group Size</p>
                        <p>{selectedPackage.groupSize || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p>{selectedPackage.type || "Standard"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accommodation</p>
                        <p>{selectedPackage.accommodationType || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Transportation</p>
                        <p>{selectedPackage.transportation || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Inclusions & Exclusions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Inclusions:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedPackage.inclusions?.map((item: string, index: number) => (
                            <li key={index} className="text-sm">
                              {item}
                            </li>
                          )) || <li className="text-sm text-muted-foreground">None specified</li>}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Exclusions:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedPackage.exclusions?.map((item: string, index: number) => (
                            <li key={index} className="text-sm">
                              {item}
                            </li>
                          )) || <li className="text-sm text-muted-foreground">None specified</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => handleEditPackage(selectedPackage)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Package Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Package</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this package? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeletePackage}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
