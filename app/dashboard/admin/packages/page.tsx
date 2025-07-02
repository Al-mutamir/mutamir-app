"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Check, Edit, Eye, Filter, Package, Plus, Search, Trash2, X } from "lucide-react"
import { getAllPackages, getAllAgencies, createPackage, updatePackage, deletePackage } from "@/lib/firebase/admin"
import { sendDiscordWebhook } from "@/lib/webhooks"
import { cn } from "@/lib/utils"

export default function AdminPackagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  type PackageType = {
    id: string
    title?: string
    description?: string
    price?: number
    duration?: number
    groupSize?: number | null
    startDate?: Date
    endDate?: Date
    location?: string
    inclusions?: string
    exclusions?: string
    itinerary?: string
    agencyId?: string | null
    agencyName?: string
    isAdminPackage?: boolean
    status?: string
    createdAt?: Date
    createdBy?: string
    displayName?: string
  }

  type AgencyType = {
    id: string
    agencyName?: string
    displayName?: string
    name?: string
    email?: string
  }

  const [packages, setPackages] = useState<PackageType[]>([])
  const [agencies, setAgencies] = useState<AgencyType[]>([])
  const [filteredPackages, setFilteredPackages] = useState<PackageType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAgency, setFilterAgency] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)

  // New package form state
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    groupSize: "",
    startDate: new Date(),
    endDate: new Date(),
    location: "",
    inclusions: "",
    exclusions: "",
    itinerary: "",
    agencyId: "",
    agencyName: "",
    isAdminPackage: false,
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [fetchedPackages, fetchedAgencies] = await Promise.all([getAllPackages(), getAllAgencies()])
        setPackages(fetchedPackages)
        setFilteredPackages(fetchedPackages)
        setAgencies(
          fetchedAgencies.map((agency) => ({
            id: agency.uid,
            agencyName: agency.agencyName ?? "Unknown Agency",
            displayName: agency.displayName ?? "",
            name: agency.name ?? "",
            email: agency.email ?? "",
          }))
        )
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Filter packages based on search query and filters
  useEffect(() => {
    let filtered = [...packages]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (pkg) =>
          pkg.title?.toLowerCase().includes(query) ||
          pkg.description?.toLowerCase().includes(query) ||
          pkg.location?.toLowerCase().includes(query) ||
          pkg.agencyName?.toLowerCase().includes(query),
      )
    }

    // Apply agency filter
    if (filterAgency !== "all") {
      if (filterAgency === "admin") {
        filtered = filtered.filter((pkg) => pkg.isAdminPackage)
      } else {
        filtered = filtered.filter((pkg) => pkg.agencyId === filterAgency)
      }
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === filterStatus)
    }

    setFilteredPackages(filtered)
  }, [searchQuery, filterAgency, filterStatus, packages])

  const handleCreatePackage = async () => {
    // Validate form
    const errors: { [key: string]: string } = {}
    if (!newPackage.title) errors.title = "Title is required"
    if (!newPackage.description) errors.description = "Description is required"
    if (!newPackage.price) errors.price = "Price is required"
    if (!newPackage.duration) errors.duration = "Duration is required"
    if (!newPackage.location) errors.location = "Location is required"
    if (!newPackage.agencyId && !newPackage.isAdminPackage) errors.agencyId = "Please select an agency or Al-Mutamir"

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setLoading(true)

      // Format the package data
      const packageData = {
        ...newPackage,
        price: Number.parseFloat(newPackage.price),
        groupSize: newPackage.groupSize ? Number.parseInt(newPackage.groupSize) : null,
        duration: Number.parseInt(newPackage.duration),
        startDate: newPackage.startDate,
        endDate: newPackage.endDate,
        status: "active",
        createdAt: new Date(),
        createdBy: user?.uid ?? "",
        isAdminPackage: newPackage.isAdminPackage,
        // If it's an admin package, set agencyId to null
        agencyId: newPackage.isAdminPackage ? null : newPackage.agencyId,
        agencyName: newPackage.isAdminPackage ? "Al-Mutamir" : newPackage.agencyName,
      }

      // Create the package
      const packageId = await createPackage(packageData)

      // Send webhook notification
      await sendDiscordWebhook({
        title: "New Package Created by Admin",
        description: `Admin has created a new package: ${newPackage.title}`,
        fields: [
          { name: "Package", value: newPackage.title },
          { name: "Price", value: `₦${newPackage.price}` },
          { name: "Created For", value: newPackage.isAdminPackage ? "Al-Mutamir" : newPackage.agencyName },
        ],
        color: 0x00ff00,
      })

      // Reset form and close dialog
      setNewPackage({
        title: "",
        description: "",
        price: "",
        duration: "",
        groupSize: "",
        startDate: new Date(),
        endDate: new Date(),
        location: "",
        inclusions: "",
        exclusions: "",
        itinerary: "",
        agencyId: "",
        agencyName: "",
        isAdminPackage: false,
      })
      setFormErrors({})
      setIsCreateDialogOpen(false)

      // Refresh packages
      const updatedPackages = await getAllPackages()
      setPackages(updatedPackages)
    } catch (error) {
      console.error("Error creating package:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!selectedPackage) return

    try {
      setLoading(true)
      await deletePackage(selectedPackage.id)

      // Send webhook notification
      await sendDiscordWebhook({
        title: "Package Deleted by Admin",
        description: `Admin has deleted a package: ${selectedPackage.title}`,
        fields: [
          { name: "Package", value: selectedPackage.title },
          { name: "Agency", value: selectedPackage.agencyName || "Al-Mutamir" },
        ],
        color: 0xff0000,
      })

      // Close dialog and refresh packages
      setIsDeleteDialogOpen(false)
      setSelectedPackage(null)

      // Refresh packages
      const updatedPackages = await getAllPackages()
      setPackages(updatedPackages)
    } catch (error) {
      console.error("Error deleting package:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePackageStatus = async (packageId: string | string[], newStatus: string) => {
    try {
      setLoading(true)
      await updatePackage(packageId, { status: newStatus })

      // Find the package
      const pkg = packages.find((p) => p.id === packageId)

      if (!pkg) {
        throw new Error("Package not found")
      }

      // Send webhook notification
      await sendDiscordWebhook({
        title: `Package ${newStatus === "active" ? "Published" : "Unpublished"} by Admin`,
        description: `Admin has ${newStatus === "active" ? "published" : "unpublished"} a package: ${pkg.title}`,
        fields: [
          { name: "Package", value: pkg.title },
          { name: "Agency", value: pkg.agencyName || "Al-Mutamir" },
          { name: "New Status", value: newStatus },
        ],
        color: newStatus === "active" ? 0x00ff00 : 0xffaa00,
      })

      // Refresh packages
      const updatedPackages = await getAllPackages()
      setPackages(updatedPackages)
    } catch (error) {
      console.error("Error updating package status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgencySelect = (agencyId: string) => {
    if (agencyId === "admin") {
      setNewPackage({
        ...newPackage,
        agencyId: "",
        agencyName: "Al-Mutamir",
        isAdminPackage: true,
      })
    } else {
      const agency = agencies.find((a) => a.id === agencyId)
      setNewPackage({
        ...newPackage,
        agencyId: agencyId,
        agencyName: agency?.agencyName || agency?.displayName || agency?.name || agency?.email || "Unknown Agency",
        isAdminPackage: false,
      })
    }
    setFormErrors({ ...formErrors, agencyId: null })
  }

  if (loading && packages.length === 0) {
    return (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout userType="admin">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Package Management</h1>
              <p className="text-muted-foreground">Manage all packages across agencies and Al-Mutamir</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Package</DialogTitle>
                  <DialogDescription>Create a new package for Al-Mutamir or on behalf of an agency</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <Label htmlFor="agency" className="mb-2 block">
                        Create Package For <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={handleAgencySelect}>
                        <SelectTrigger id="agency" className={cn(formErrors.agencyId && "border-red-500")}>
                          <SelectValue placeholder="Select agency or Al-Mutamir" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Al-Mutamir (Admin Package)</SelectItem>
                          <SelectItem value="divider" disabled>
                            ────────────────────────────
                          </SelectItem>
                          {agencies.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.agencyName ||
                                agency.displayName ||
                                agency.name ||
                                agency.email ||
                                "Unknown Agency"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.agencyId && <p className="text-red-500 text-sm mt-1">{formErrors.agencyId}</p>}
                      {newPackage.agencyName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Creating package for: <span className="font-medium">{newPackage.agencyName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="mb-2 block">
                        Package Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={newPackage.title}
                        onChange={(e) => {
                          setNewPackage({ ...newPackage, title: e.target.value })
                          setFormErrors({ ...formErrors, title: null })
                        }}
                        className={cn(formErrors.title && "border-red-500")}
                      />
                      {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                    </div>
                    <div>
                      <Label htmlFor="location" className="mb-2 block">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="location"
                        value={newPackage.location}
                        onChange={(e) => {
                          setNewPackage({ ...newPackage, location: e.target.value })
                          setFormErrors({ ...formErrors, location: null })
                        }}
                        className={cn(formErrors.location && "border-red-500")}
                      />
                      {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="mb-2 block">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={newPackage.description}
                      onChange={(e) => {
                        setNewPackage({ ...newPackage, description: e.target.value })
                        setFormErrors({ ...formErrors, description: null })
                      }}
                      className={cn(formErrors.description && "border-red-500")}
                      rows={3}
                    />
                    {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="mb-2 block">
                        Price (₦) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newPackage.price}
                        onChange={(e) => {
                          setNewPackage({ ...newPackage, price: e.target.value })
                          setFormErrors({ ...formErrors, price: null })
                        }}
                        className={cn(formErrors.price && "border-red-500")}
                      />
                      {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                    </div>
                    <div>
                      <Label htmlFor="duration" className="mb-2 block">
                        Duration (days) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newPackage.duration}
                        onChange={(e) => {
                          setNewPackage({ ...newPackage, duration: e.target.value })
                          setFormErrors({ ...formErrors, duration: null })
                        }}
                        className={cn(formErrors.duration && "border-red-500")}
                      />
                      {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
                    </div>
                    <div>
                      <Label htmlFor="groupSize" className="mb-2 block">
                        Group Size
                      </Label>
                      <Input
                        id="groupSize"
                        type="number"
                        value={newPackage.groupSize}
                        onChange={(e) => setNewPackage({ ...newPackage, groupSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newPackage.startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newPackage.startDate ? format(newPackage.startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newPackage.startDate}
                            onSelect={(date) => {
                              if (date) setNewPackage({ ...newPackage, startDate: date })
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="mb-2 block">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newPackage.endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newPackage.endDate ? format(newPackage.endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newPackage.endDate}
                            onSelect={(date) => {
                              if (date) setNewPackage({ ...newPackage, endDate: date })
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inclusions" className="mb-2 block">
                      Inclusions
                    </Label>
                    <Textarea
                      id="inclusions"
                      value={newPackage.inclusions}
                      onChange={(e) => setNewPackage({ ...newPackage, inclusions: e.target.value })}
                      placeholder="What's included in the package? (e.g., accommodation, meals, transportation)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exclusions" className="mb-2 block">
                      Exclusions
                    </Label>
                    <Textarea
                      id="exclusions"
                      value={newPackage.exclusions}
                      onChange={(e) => setNewPackage({ ...newPackage, exclusions: e.target.value })}
                      placeholder="What's not included in the package? (e.g., flights, visa fees)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="itinerary" className="mb-2 block">
                      Itinerary
                    </Label>
                    <Textarea
                      id="itinerary"
                      value={newPackage.itinerary}
                      onChange={(e) => setNewPackage({ ...newPackage, itinerary: e.target.value })}
                      placeholder="Day-by-day breakdown of activities"
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePackage}>Create Package</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <div className="flex gap-2">
              <Select value={filterAgency} onValueChange={setFilterAgency}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  <SelectItem value="admin">Al-Mutamir Only</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.agencyName || agency.displayName || agency.name || agency.email || "Unknown Agency"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    {searchQuery || filterAgency !== "all" || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first package to get started"}
                  </p>
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
                            <span className="text-sm text-muted-foreground">Location:</span>
                            <span>{pkg.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Agency:</span>
                            <span className="font-medium">
                              {pkg.isAdminPackage
                                ? "Al-Mutamir"
                                : pkg.agencyName || pkg.displayName || "Unknown Agency"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-3 border-t">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/packages/${pkg.id}`)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/admin/packages/edit/${pkg.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          {pkg.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-amber-600 !px-2"
                              onClick={() => handleUpdatePackageStatus(pkg.id, "draft")}
                            >
                              <X className="h-4 w-4 mr-1" /> Unpublish
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleUpdatePackageStatus(pkg.id, "active")}
                            >
                              <Check className="h-4 w-4 mr-1" /> Publish
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedPackage(pkg)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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
                    {searchQuery || filterAgency !== "all" || filterStatus !== "all"
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
                        <th className="text-left p-3 font-medium">Agency</th>
                        <th className="text-left p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Duration</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.map((pkg, index) => (
                        <tr key={pkg.id} className={cn("border-t", index % 2 === 0 ? "bg-white" : "bg-muted/30")}>
                          <td className="p-3">
                            <div className="font-medium">{pkg.title}</div>
                            <div className="text-sm text-muted-foreground">{pkg.location}</div>
                          </td>
                          <td className="p-3">
                            {pkg.isAdminPackage ? "Al-Mutamir" : pkg.agencyName || pkg.displayName || "Unknown Agency"}
                          </td>
                          <td className="p-3">₦{pkg.price?.toLocaleString()}</td>
                          <td className="p-3">{pkg.duration} days</td>
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
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => router.push(`/packages/${pkg.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/admin/packages/edit/${pkg.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {pkg.status === "active" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-amber-600 !px-2"
                                  onClick={() => handleUpdatePackageStatus(pkg.id, "draft")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() => handleUpdatePackageStatus(pkg.id, "active")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedPackage(pkg)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Package</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this package? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedPackage && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">{selectedPackage.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPackage.description}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Price: ₦{selectedPackage.price?.toLocaleString()}</span>
                    <span className="text-sm">
                      Agency: {selectedPackage.isAdminPackage ? "Al-Mutamir" : selectedPackage.agencyName}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePackage}>
                Delete Package
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
