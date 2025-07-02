"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Filter } from "lucide-react"
import { getAllPilgrims } from "@/lib/firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"

// Define the Pilgrim interface
interface Pilgrim {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  status: "active" | "inactive";
  createdAt?: string;
  passportNumber?: string;
  passportExpiry?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
}

export default function AdminPilgrimsPage() {
  const [loading, setLoading] = useState(true)
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([])
  const [filteredPilgrims, setFilteredPilgrims] = useState<Pilgrim[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  // Fix: Properly type selectedPilgrim
  const [selectedPilgrim, setSelectedPilgrim] = useState<Pilgrim | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPilgrims = async () => {
      try {
        setLoading(true)
        const allPilgrims = await getAllPilgrims()
        setPilgrims(allPilgrims)
        setFilteredPilgrims(allPilgrims)
      } catch (error) {
        console.error("Error fetching pilgrims:", error)
        toast({
          title: "Error",
          description: "Failed to load pilgrims data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPilgrims()
  }, [toast])

  useEffect(() => {
    // Filter pilgrims based on search term and filter
    const filterPilgrims = () => {
      let filtered = pilgrims

      // Apply status filter
      if (filter === "active") {
        filtered = filtered.filter((pilgrim) => pilgrim.status === "active")
      } else if (filter === "inactive") {
        filtered = filtered.filter((pilgrim) => pilgrim.status === "inactive")
      }

      // Apply search term
      if (searchTerm) {
        filtered = filtered.filter(
          (pilgrim) =>
            pilgrim.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pilgrim.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pilgrim.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pilgrim.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setFilteredPilgrims(filtered)
    }

    filterPilgrims()
  }, [searchTerm, filter, pilgrims])

  // Fix: Properly type the parameter
  const handleViewPilgrim = (pilgrim: Pilgrim) => {
    setSelectedPilgrim(pilgrim)
    setIsViewDialogOpen(true)
  }

  const content = (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Pilgrim Management</h1>
        <Button onClick={() => router.push("/dashboard/admin")}>Back to Dashboard</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search pilgrims by name, email or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <span className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pilgrims</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Pilgrims</CardTitle>
              <CardDescription>
                {filteredPilgrims.length} {filteredPilgrims.length === 1 ? "pilgrim" : "pilgrims"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 bg-gray-100 p-4 font-medium">
                  <div className="col-span-2">Pilgrim</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div>Joined</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredPilgrims.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No pilgrims found</div>
                  ) : (
                    filteredPilgrims.map((pilgrim) => (
                      <div key={pilgrim.id} className="grid grid-cols-6 p-4 items-center">
                        <div className="col-span-2">
                          <div className="font-medium">
                            {pilgrim.firstName} {pilgrim.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{pilgrim.email}</div>
                        </div>
                        <div className="text-sm">
                          {pilgrim.city || "Unknown"}, {pilgrim.country || "Unknown"}
                        </div>
                        <div>
                          <Badge
                            variant={pilgrim.status === "active" ? "success" : "secondary"}
                            className={pilgrim.status === "active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {pilgrim.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pilgrim.createdAt ? new Date(pilgrim.createdAt).toLocaleDateString() : "Unknown"}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewPilgrim(pilgrim)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPilgrims.length === 0 ? (
              <div className="col-span-3 p-4 text-center text-muted-foreground">No pilgrims found</div>
            ) : (
              filteredPilgrims.map((pilgrim) => (
                <Card key={pilgrim.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {pilgrim.firstName} {pilgrim.lastName}
                      </CardTitle>
                      <Badge
                        variant={pilgrim.status === "active" ? "success" : "secondary"}
                        className={pilgrim.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {pilgrim.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{pilgrim.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        {pilgrim.city || "Unknown"}, {pilgrim.country || "Unknown"}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Phone: </span>
                        {pilgrim.phone || "Not provided"}
                      </div>
                      {pilgrim.passportNumber && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Passport: </span>
                          {pilgrim.passportNumber}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-2 p-4 pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleViewPilgrim(pilgrim)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Pilgrim Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pilgrim Details</DialogTitle>
            <DialogDescription>Detailed information about the pilgrim</DialogDescription>
          </DialogHeader>
          {selectedPilgrim && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedPilgrim.firstName} {selectedPilgrim.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedPilgrim.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{selectedPilgrim.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={selectedPilgrim.status === "active" ? "success" : "secondary"}
                      className={selectedPilgrim.status === "active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {selectedPilgrim.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Location & Personal Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p>{selectedPilgrim.country || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p>{selectedPilgrim.city || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p>{selectedPilgrim.address || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p>
                      {selectedPilgrim.dateOfBirth
                        ? new Date(selectedPilgrim.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
              {selectedPilgrim.passportNumber && (
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Travel Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Passport Number</p>
                      <p>{selectedPilgrim.passportNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Passport Expiry</p>
                      <p>
                        {selectedPilgrim.passportExpiry
                          ? new Date(selectedPilgrim.passportExpiry).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {selectedPilgrim.emergencyContact && selectedPilgrim.emergencyContact.name && (
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p>{selectedPilgrim.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p>{selectedPilgrim.emergencyContact.relationship || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{selectedPilgrim.emergencyContact.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Navigate to bookings filtered by this pilgrim
                if (selectedPilgrim) {
                  router.push(`/dashboard/admin/bookings?pilgrimId=${selectedPilgrim.id}`)
                  setIsViewDialogOpen(false)
                }
              }}
            >
              View Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Pilgrim Management</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-48" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return <DashboardLayout userType="admin">{content}</DashboardLayout>
}
