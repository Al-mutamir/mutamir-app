"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Check, X, Trash2, Eye, Plus, Filter } from "lucide-react"
import { getAgencies, updateAgencyVerification, deleteAgency } from "@/lib/firebase/admin"
import { sendWebhook } from "@/lib/webhooks"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminAgenciesPage() {
  const [loading, setLoading] = useState(true)
  const [agencies, setAgencies] = useState<any[]>([])
  const [filteredAgencies, setFilteredAgencies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedAgency, setSelectedAgency] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newAgency, setNewAgency] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "Nigeria",
    city: "",
    description: "",
  })
  const { toast } = useToast()

  // Discord webhook URL for agency actions
  const AGENCY_WEBHOOK_URL =
    "https://discordapp.com/api/webhooks/1374113386253779108/XH6kho8D3qVdypWpRDcJdv_0ZrJ1FEKgV67yYbbAFLl5NUBRAXy-PANaev6JItiZBkRU"
  const AGENCY_CREATION_WEBHOOK_URL =
    "https://discordapp.com/api/webhooks/1374112883260002304/LR9DEcBQPEl2OQ6AWVS9JNUQlZaXt2os3o54zCTD8iIgYDoUYhmrEjD1-2Do099xw7SB"

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
    // Filter agencies based on search term and filter
    const filterAgencies = () => {
      let filtered = agencies

      // Apply verification filter
      if (filter === "verified") {
        filtered = filtered.filter((agency) => agency.verified)
      } else if (filter === "unverified") {
        filtered = filtered.filter((agency) => !agency.verified)
      }

      // Apply search term
      if (searchTerm) {
        filtered = filtered.filter(
          (agency) =>
            agency.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agency.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agency.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agency.cityOfOperation?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setFilteredAgencies(filtered)
    }

    filterAgencies()
  }, [searchTerm, filter, agencies])

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

      // Find the agency to include details in webhook
      const agency = agencies.find((a) => a.uid === agencyId)

      // Send webhook notification
      await sendWebhook(AGENCY_WEBHOOK_URL, {
        content: `**Agency ${verified ? "Verified" : "Unverified"}**`,
        embeds: [
          {
            title: verified ? "Agency Verified" : "Agency Unverified",
            description: `An agency has been ${verified ? "verified" : "unverified"} by admin.`,
            color: verified ? 0x00ff00 : 0xff9900,
            fields: [
              {
                name: "Agency Name",
                value: agency?.agencyName || "Unknown",
                inline: true,
              },
              {
                name: "Email",
                value: agency?.email || "Unknown",
                inline: true,
              },
              {
                name: "Status",
                value: verified ? "Verified ✅" : "Unverified ❌",
                inline: true,
              },
              {
                name: "Location",
                value: `${agency?.cityOfOperation || "Unknown"}, ${agency?.countryOfOperation || "Unknown"}`,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      })

      toast({
        title: verified ? "Agency verified" : "Agency unverified",
        description: `${agency?.agencyName || "Agency"} has been ${verified ? "verified" : "unverified"}.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating agency verification:", error)
      toast({
        title: "Error",
        description: "Failed to update agency verification status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAgency = (agency: any) => {
    setSelectedAgency(agency)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAgency = async () => {
    try {
      await deleteAgency(selectedAgency.uid)

      // Send webhook notification
      await sendWebhook(AGENCY_WEBHOOK_URL, {
        content: `**Agency Deleted**`,
        embeds: [
          {
            title: "Agency Deleted",
            description: `An agency has been deleted by admin.`,
            color: 0xff0000,
            fields: [
              {
                name: "Agency Name",
                value: selectedAgency?.agencyName || "Unknown",
                inline: true,
              },
              {
                name: "Email",
                value: selectedAgency?.email || "Unknown",
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      })

      // Update local state
      setAgencies((prevAgencies) => prevAgencies.filter((agency) => agency.uid !== selectedAgency.uid))

      toast({
        title: "Agency deleted",
        description: `${selectedAgency.agencyName || "Agency"} has been deleted.`,
        variant: "default",
      })

      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete agency",
        variant: "destructive",
      })
    }
  }

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      // This would typically connect to a server function to create an agency
      // For demo purposes, we'll just simulate this
      const newAgencyId = "agency_" + Date.now()
      const createdAgency = {
        uid: newAgencyId,
        agencyName: newAgency.name,
        email: newAgency.email,
        phone: newAgency.phone,
        address: newAgency.address,
        countryOfOperation: newAgency.country,
        cityOfOperation: newAgency.city,
        description: newAgency.description,
        verified: false,
        role: "agency",
        createdAt: new Date().toISOString(),
      }

      // Update local state
      setAgencies((prevAgencies) => [...prevAgencies, createdAgency])

      // Send webhook notification for agency creation
      await sendWebhook(AGENCY_CREATION_WEBHOOK_URL, {
        content: `**New Agency Created**`,
        embeds: [
          {
            title: "New Agency Created",
            description: `A new agency has been created by admin.`,
            color: 0x00ffff,
            fields: [
              {
                name: "Agency Name",
                value: newAgency.name,
                inline: true,
              },
              {
                name: "Email",
                value: newAgency.email,
                inline: true,
              },
              {
                name: "Location",
                value: `${newAgency.city}, ${newAgency.country}`,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      })

      // Reset form and close dialog
      setNewAgency({
        name: "",
        email: "",
        phone: "",
        address: "",
        country: "Nigeria",
        city: "",
        description: "",
      })
      setIsCreateDialogOpen(false)

      toast({
        title: "Agency created",
        description: `${newAgency.name} has been created successfully.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error creating agency:", error)
      toast({
        title: "Error",
        description: "Failed to create agency.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="admin" title="Agency Management" description="Manage all agencies on the platform">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout userType="admin" title="Agency Management" description="Manage all agencies on the platform">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">Agency Management</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Create Agency
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search agencies by name, email or location..."
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
                <SelectItem value="all">All Agencies</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Agencies</CardTitle>
                  <CardDescription>
                    {filteredAgencies.length} {filteredAgencies.length === 1 ? "agency" : "agencies"} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 bg-gray-100 p-4 font-medium">
                      <div className="col-span-2">Agency</div>
                      <div>Location</div>
                      <div>Status</div>
                      <div>Created At</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {filteredAgencies.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No agencies found</div>
                      ) : (
                        filteredAgencies.map((agency) => (
                          <div key={agency.uid} className="grid grid-cols-6 p-4 items-center">
                            <div className="col-span-2">
                              <div className="font-medium">
                                {agency.agencyName || agency.displayName || "Unnamed Agency"}
                              </div>
                              <div className="text-sm text-muted-foreground">{agency.email}</div>
                            </div>
                            <div className="text-sm">
                              {agency.cityOfOperation}, {agency.countryOfOperation}
                            </div>
                            <div>
                              <Badge
                                variant={agency.verified ? "default" : "secondary"}
                                className={agency.verified ? "bg-green-100 text-green-800" : ""}
                              >
                                {agency.verified ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : "Unknown"}
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleViewAgency(agency)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {agency.verified ? (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-amber-600 border-amber-600"
                                  onClick={() => handleVerifyAgency(agency.uid, false)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-green-600 border-green-600"
                                  onClick={() => handleVerifyAgency(agency.uid, true)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteAgency(agency)}>
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
            </TabsContent>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgencies.length === 0 ? (
                  <div className="col-span-3 p-4 text-center text-muted-foreground">No agencies found</div>
                ) : (
                  filteredAgencies.map((agency) => (
                    <Card key={agency.uid} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {agency.agencyName || agency.displayName || "Unnamed Agency"}
                          </CardTitle>
                          <Badge
                            variant={agency.verified ? "default" : "secondary"}
                            className={agency.verified ? "bg-green-100 text-green-800" : ""}
                          >
                            {agency.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                        <CardDescription>{agency.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Location: </span>
                            {agency.cityOfOperation}, {agency.countryOfOperation}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Phone: </span>
                            {agency.phone || "Not provided"}
                          </div>
                          {agency.description && (
                            <div className="text-sm mt-2">
                              <p className="line-clamp-2">{agency.description}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="flex justify-end gap-2 p-4 pt-0">
                        <Button variant="outline" size="sm" onClick={() => handleViewAgency(agency)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        {agency.verified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-600"
                            onClick={() => handleVerifyAgency(agency.uid, false)}
                          >
                            <X className="h-4 w-4 mr-1" /> Unverify
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600"
                            onClick={() => handleVerifyAgency(agency.uid, true)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Verify
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

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
                        <p className="font-medium">
                          {selectedAgency.agencyName || selectedAgency.displayName || "Unnamed Agency"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedAgency.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{selectedAgency.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={selectedAgency.verified ? "default" : "secondary"}
                          className={selectedAgency.verified ? "bg-green-100 text-green-800" : ""}
                        >
                          {selectedAgency.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Location & Operations</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Country of Operation</p>
                        <p>{selectedAgency.countryOfOperation || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">City of Operation</p>
                        <p>{selectedAgency.cityOfOperation || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p>{selectedAgency.address || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Created</p>
                        <p>
                          {selectedAgency.createdAt
                            ? new Date(selectedAgency.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedAgency.description && (
                    <div className="col-span-1 md:col-span-2">
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-sm">{selectedAgency.description}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedAgency && (
                  <>
                    {selectedAgency.verified ? (
                      <Button
                        variant="outline"
                        className="text-amber-600 border-amber-600"
                        onClick={() => {
                          handleVerifyAgency(selectedAgency.uid, false)
                          setIsViewDialogOpen(false)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-600"
                        onClick={() => {
                          handleVerifyAgency(selectedAgency.uid, true)
                          setIsViewDialogOpen(false)
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsViewDialogOpen(false)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Agency Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Agency</DialogTitle>
                <DialogDescription>Add a new agency to the platform</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAgency}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agency Name</Label>
                    <Input
                      id="name"
                      value={newAgency.name}
                      onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAgency.email}
                      onChange={(e) => setNewAgency({ ...newAgency, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newAgency.phone}
                      onChange={(e) => setNewAgency({ ...newAgency, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={newAgency.country}
                      onValueChange={(value) => setNewAgency({ ...newAgency, country: value })}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                        <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAgency.city}
                      onChange={(e) => setNewAgency({ ...newAgency, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newAgency.address}
                      onChange={(e) => setNewAgency({ ...newAgency, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newAgency.description}
                      onChange={(e) => setNewAgency({ ...newAgency, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Agency</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Agency Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Agency</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this agency? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAgency}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
