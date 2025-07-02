"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  Package,
  Calendar,
  BarChart3,
  Building2,
  LogOut,
  Settings,
  Shield,
  Plus,
  Minus,
  Save,
  ArrowLeft,
} from "lucide-react"
import { createPackage, getAgencies } from "@/lib/firebase/admin"
import AdminProtectedRoute from "@/components/admin-protected-route"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function CreatePackagePage() {
  const [loading, setLoading] = useState(false)
  const [packageData, setPackageData] = useState({
    title: "",
    description: "",
    price: 0,
    duration: 7,
    inclusions: [""],
    exclusions: [""],
    agencyId: "",
    agencyName: "",
    status: "draft",
    groupSize: 10,
    type: "Umrah",
    accommodationType: "Hotel",
    transportation: "Flight + Bus",
    meals: "Full Board",
    itinerary: [{ title: "Day 1", description: "Arrival and check-in" }],
  })
  const [agencies, setAgencies] = useState<any[]>([])
  const [loadingAgencies, setLoadingAgencies] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem("admin-token")
    router.push("/auth/login")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "price" || name === "duration" || name === "groupSize") {
      setPackageData({
        ...packageData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setPackageData({
        ...packageData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setPackageData({
      ...packageData,
      [name]: value,
    })
  }

  const handleInclusionChange = (index: number, value: string) => {
    const newInclusions = [...packageData.inclusions]
    newInclusions[index] = value
    setPackageData({
      ...packageData,
      inclusions: newInclusions,
    })
  }

  const handleExclusionChange = (index: number, value: string) => {
    const newExclusions = [...packageData.exclusions]
    newExclusions[index] = value
    setPackageData({
      ...packageData,
      exclusions: newExclusions,
    })
  }

  const handleItineraryChange = (index: number, field: string, value: string) => {
    const newItinerary = [...packageData.itinerary]
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: value,
    }
    setPackageData({
      ...packageData,
      itinerary: newItinerary,
    })
  }

  const addInclusion = () => {
    setPackageData({
      ...packageData,
      inclusions: [...packageData.inclusions, ""],
    })
  }

  const removeInclusion = (index: number) => {
    if (packageData.inclusions.length > 1) {
      const newInclusions = [...packageData.inclusions]
      newInclusions.splice(index, 1)
      setPackageData({
        ...packageData,
        inclusions: newInclusions,
      })
    }
  }

  const addExclusion = () => {
    setPackageData({
      ...packageData,
      exclusions: [...packageData.exclusions, ""],
    })
  }

  const removeExclusion = (index: number) => {
    if (packageData.exclusions.length > 1) {
      const newExclusions = [...packageData.exclusions]
      newExclusions.splice(index, 1)
      setPackageData({
        ...packageData,
        exclusions: newExclusions,
      })
    }
  }

  const addItineraryDay = () => {
    const newDay = packageData.itinerary.length + 1
    setPackageData({
      ...packageData,
      itinerary: [...packageData.itinerary, { title: `Day ${newDay}`, description: "" }],
    })
  }

  const removeItineraryDay = (index: number) => {
    if (packageData.itinerary.length > 1) {
      const newItinerary = [...packageData.itinerary]
      newItinerary.splice(index, 1)
      setPackageData({
        ...packageData,
        itinerary: newItinerary,
      })
    }
  }

  const handleAgencySelect = (value: string) => {
    if (value === "admin") {
      setPackageData({
        ...packageData,
        agencyId: "admin",
        agencyName: "Al-Mutamir",
      })
    } else {
      const selectedAgency = agencies.find((agency) => agency.uid === value)
      if (selectedAgency) {
        setPackageData({
          ...packageData,
          agencyId: selectedAgency.uid,
          agencyName: selectedAgency.agencyName || selectedAgency.displayName || selectedAgency.email,
        })
      }
    }
  }

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoadingAgencies(true)
        const allAgencies = await getAgencies()
        setAgencies(allAgencies)
      } catch (error) {
        console.error("Error fetching agencies:", error)
        toast({
          title: "Error",
          description: "Failed to load agencies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingAgencies(false)
      }
    }

    fetchAgencies()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "active") => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!packageData.title || !packageData.description || packageData.price <= 0 || !packageData.agencyId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields including selecting an agency",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Filter out empty inclusions and exclusions
      const filteredInclusions = packageData.inclusions.filter((item) => item.trim() !== "")
      const filteredExclusions = packageData.exclusions.filter((item) => item.trim() !== "")

      // Create package with status
      const packageId = await createPackage({
        ...packageData,
        inclusions: filteredInclusions,
        exclusions: filteredExclusions,
        status,
      })

      toast({
        title: status === "active" ? "Package Published" : "Package Saved",
        description:
          status === "active"
            ? "The package has been published and is now visible to users"
            : "The package has been saved as a draft",
        variant: "default",
      })

      // Redirect to packages list
      router.push("/admin/dashboard/packages")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="mr-4" onClick={() => router.push("/admin/dashboard/packages")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Create Package</h1>
          </div>

          <form onSubmit={(e) => handleSubmit(e, "draft")}>
            <div className="grid grid-cols-1 gap-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of the package</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={packageData.title}
                        onChange={handleChange}
                        placeholder="Enter package title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Package Type</Label>
                      <Select
                        defaultValue={packageData.type}
                        onValueChange={(value) => handleSelectChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select package type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Umrah">Umrah</SelectItem>
                          <SelectItem value="Hajj">Hajj</SelectItem>
                          <SelectItem value="Umrah+">Umrah+</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={packageData.description}
                        onChange={handleChange}
                        placeholder="Enter package description"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Price (₦) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={packageData.price}
                        onChange={handleChange}
                        placeholder="Enter package price"
                        min={0}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        value={packageData.duration}
                        onChange={handleChange}
                        placeholder="Enter package duration"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="agency">
                        Create Package For <span className="text-red-500">*</span>
                      </Label>
                      <Select defaultValue="" onValueChange={handleAgencySelect} disabled={loadingAgencies}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={loadingAgencies ? "Loading agencies..." : "Select agency or Al-Mutamir"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Al-Mutamir (Admin)</SelectItem>
                          <SelectItem value="" disabled>
                            ── Agencies ──
                          </SelectItem>
                          {agencies.map((agency) => (
                            <SelectItem key={agency.uid} value={agency.uid}>
                              {agency.agencyName || agency.displayName || agency.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {packageData.agencyName && (
                        <p className="text-sm text-muted-foreground">
                          Creating package for: <span className="font-medium">{packageData.agencyName}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupSize">Group Size</Label>
                      <Input
                        id="groupSize"
                        name="groupSize"
                        type="number"
                        value={packageData.groupSize}
                        onChange={handleChange}
                        placeholder="Enter group size"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accommodationType">Accommodation Type</Label>
                      <Select
                        defaultValue={packageData.accommodationType}
                        onValueChange={(value) => handleSelectChange("accommodationType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select accommodation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hotel">Hotel</SelectItem>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Tent">Tent</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transportation">Transportation</Label>
                      <Select
                        defaultValue={packageData.transportation}
                        onValueChange={(value) => handleSelectChange("transportation", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transportation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flight + Bus">Flight + Bus</SelectItem>
                          <SelectItem value="Flight Only">Flight Only</SelectItem>
                          <SelectItem value="Bus Only">Bus Only</SelectItem>
                          <SelectItem value="Not Included">Not Included</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meals">Meals</Label>
                      <Select
                        defaultValue={packageData.meals}
                        onValueChange={(value) => handleSelectChange("meals", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Board">Full Board</SelectItem>
                          <SelectItem value="Half Board">Half Board</SelectItem>
                          <SelectItem value="Breakfast Only">Breakfast Only</SelectItem>
                          <SelectItem value="Not Included">Not Included</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inclusions & Exclusions */}
              <Card>
                <CardHeader>
                  <CardTitle>Inclusions & Exclusions</CardTitle>
                  <CardDescription>Specify what is included and excluded in the package</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Inclusions</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addInclusion}>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {packageData.inclusions.map((inclusion, index) => (
                          <div key={`inclusion-${index}`} className="flex items-center gap-2">
                            <Input
                              value={inclusion}
                              onChange={(e) => handleInclusionChange(index, e.target.value)}
                              placeholder={`Inclusion ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInclusion(index)}
                              disabled={packageData.inclusions.length <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Exclusions</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addExclusion}>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {packageData.exclusions.map((exclusion, index) => (
                          <div key={`exclusion-${index}`} className="flex items-center gap-2">
                            <Input
                              value={exclusion}
                              onChange={(e) => handleExclusionChange(index, e.target.value)}
                              placeholder={`Exclusion ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExclusion(index)}
                              disabled={packageData.exclusions.length <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Itinerary */}
              <Card>
                <CardHeader>
                  <CardTitle>Itinerary</CardTitle>
                  <CardDescription>Outline the day-by-day itinerary for the package</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={addItineraryDay}>
                        <Plus className="h-4 w-4 mr-1" /> Add Day
                      </Button>
                    </div>
                    {packageData.itinerary.map((day, index) => (
                      <div key={`day-${index}`} className="border p-4 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Day {index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItineraryDay(index)}
                            disabled={packageData.itinerary.length <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`day-${index}-title`}>Title</Label>
                            <Input
                              id={`day-${index}-title`}
                              value={day.title}
                              onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                              placeholder="Day title"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`day-${index}-description`}>Description</Label>
                            <Textarea
                              id={`day-${index}-description`}
                              value={day.description}
                              onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                              placeholder="Day description"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/dashboard/packages")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button type="button" onClick={(e) => handleSubmit(e, "active")} disabled={loading}>
                  Publish
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
