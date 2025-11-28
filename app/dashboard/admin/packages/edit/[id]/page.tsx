"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ArrowLeft } from "lucide-react"
import { getPackageById, updatePackage, getAllAgencies } from "@/lib/firebase/admin"
import { sendDiscordWebhook } from "@/lib/webhooks"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

// Types and Interfaces
interface FirestoreTimestamp {
  toDate(): Date
}

export interface FirestorePackage {
  id: string
  title: string
  description: string
  price: number
  duration: number
  groupSize?: number | null
  startDate?: FirestoreTimestamp
  endDate?: FirestoreTimestamp
  location: string
  inclusions?: string
  exclusions?: string
  itinerary?: string
  agencyId?: string | null
  agencyName?: string
  isAdminPackage?: boolean
  status?: string
  createdAt?: FirestoreTimestamp
  updatedAt?: FirestoreTimestamp
  updatedBy?: string
  [key: string]: any
}

export interface Package {
  id: string
  title: string
  description: string
  price: number
  duration: number
  groupSize: number | null
  startDate?: Date
  endDate?: Date
  location: string
  inclusions?: string
  exclusions?: string
  itinerary?: string
  agencyId?: string | null
  agencyName?: string
  isAdminPackage?: boolean
  status: string
  updatedAt?: Date
  updatedBy?: string
}

export interface Agency {
  uid: string // Changed from 'id' to 'uid' to match Firebase response
  id?: string // Keep id as optional for backward compatibility
  agencyName?: any
  name?: string
  displayName?: string
  email: string
  phoneNumber?: any
  cityOfOperation?: any
  countryOfOperation?: any
  verified?: any
  createdAt?: any
}

type FormErrors = Partial<Record<keyof Package, string>>

interface LoadingState {
  isLoading: boolean
  isSaving: boolean
}

interface AlertState {
  success: boolean
  error: string
}

// Utility Functions
const convertFirestoreTimestamp = (timestamp: any): Date | undefined => {
  if (!timestamp) return undefined
  if (timestamp instanceof Date) return timestamp
  if (typeof timestamp === "string") return new Date(timestamp)
  if (typeof timestamp === "object" && typeof timestamp.toDate === "function") {
    return timestamp.toDate()
  }
  return undefined
}

const mapFirestoreToPackage = (firestorePackage: FirestorePackage): Package => ({
  id: firestorePackage.id,
  title: firestorePackage.title,
  description: firestorePackage.description,
  price: Number(firestorePackage.price) || 0,
  duration: Number(firestorePackage.duration) || 0,
  groupSize: firestorePackage.groupSize !== undefined && firestorePackage.groupSize !== null
    ? Number(firestorePackage.groupSize)
    : null,
  startDate: convertFirestoreTimestamp(firestorePackage.startDate),
  endDate: convertFirestoreTimestamp(firestorePackage.endDate),
  location: firestorePackage.location || "",
  inclusions: firestorePackage.inclusions || "",
  exclusions: firestorePackage.exclusions || "",
  itinerary: firestorePackage.itinerary || "",
  agencyId: firestorePackage.agencyId || null,
  agencyName: firestorePackage.agencyName || "",
  isAdminPackage: firestorePackage.isAdminPackage || false,
  status: firestorePackage.status || "active",
  updatedAt: convertFirestoreTimestamp(firestorePackage.updatedAt),
  updatedBy: firestorePackage.updatedBy,
})

const validatePackageForm = (packageData: Package): FormErrors => {
  const errors: FormErrors = {}
  
  if (!packageData.title?.trim()) {
    errors.title = "Title is required"
  }
  
  if (!packageData.description?.trim()) {
    errors.description = "Description is required"
  }
  
  if (!packageData.price || packageData.price <= 0) {
    errors.price = "Price is required and must be greater than 0"
  }
  
  if (!packageData.duration || packageData.duration <= 0) {
    errors.duration = "Duration is required and must be greater than 0"
  }
  
  if (!packageData.location?.trim()) {
    errors.location = "Location is required"
  }
  
  return errors
}

const getAgencyDisplayName = (agency: Agency): string => {
  return agency.name || agency.displayName || agency.agencyName || agency.email || "Unknown Agency"
}

// Custom Hooks
const usePackageData = (packageId: string) => {
  const [packageData, setPackageData] = useState<Package>({
    id: "",
    title: "",
    description: "",
    price: 0,
    duration: 0,
    groupSize: null,
    startDate: new Date(),
    endDate: new Date(),
    location: "",
    inclusions: "",
    exclusions: "",
    itinerary: "",
    agencyId: null,
    agencyName: "",
    isAdminPackage: false,
    status: "active",
  })
  
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [originalAgencyId, setOriginalAgencyId] = useState("")
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    isSaving: false,
  })
  
  const fetchData = async (): Promise<void> => {
    if (!packageId) return
    
    try {
      setLoadingState(prev => ({ ...prev, isLoading: true }))
      
      const [firestorePackage, fetchedAgencies] = await Promise.all([
        getPackageById(packageId) as Promise<FirestorePackage | null>,
        getAllAgencies() as Promise<any[]>, // Use any[] to avoid type conflicts
      ])
      
      if (!firestorePackage) {
        throw new Error("Package not found")
      }
      
      // Map the fetched agencies to ensure they have the expected structure
      const mappedAgencies: Agency[] = fetchedAgencies.map(agency => ({
        ...agency,
        id: agency.uid || agency.id, // Ensure id property exists
      }))
      
      const mappedPackage = mapFirestoreToPackage(firestorePackage)
      setPackageData(mappedPackage)
      setOriginalAgencyId(firestorePackage.agencyId || "admin")
      setAgencies(mappedAgencies)
    } catch (error) {
      console.error("Error fetching package data:", error)
      throw error
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }
  
  return {
    packageData,
    setPackageData,
    agencies,
    originalAgencyId,
    loadingState,
    setLoadingState,
    fetchData,
  }
}

// Main Component
export default function EditPackagePage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const packageId = params?.id as string
  
  const {
    packageData,
    setPackageData,
    agencies,
    originalAgencyId,
    loadingState,
    setLoadingState,
    fetchData,
  } = usePackageData(packageId)
  
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [alertState, setAlertState] = useState<AlertState>({
    success: false,
    error: "",
  })
  
  useEffect(() => {
    if (user && packageId) {
      fetchData().catch((error) => {
        setAlertState({ success: false, error: "Failed to load package data" })
        router.push("/dashboard/admin/packages")
      })
    }
  }, [user, packageId, router])
  
  const updatePackageField = <K extends keyof Package>(
    field: K,
    value: Package[K]
  ): void => {
    setPackageData(prev => ({ ...prev, [field]: value }))
    setFormErrors(prev => ({ ...prev, [field]: undefined }))
  }
  
  const handleAgencySelect = (agencyId: string): void => {
    if (agencyId === "admin") {
      setPackageData(prev => ({
        ...prev,
        agencyId: null,
        agencyName: "Almutamir",
        isAdminPackage: true,
      }))
    } else {
      const agency = agencies.find(a => (a.id || a.uid) === agencyId)
      setPackageData(prev => ({
        ...prev,
        agencyId,
        agencyName: agency ? getAgencyDisplayName(agency) : "Unknown Agency",
        isAdminPackage: false,
      }))
    }
    setFormErrors(prev => ({ ...prev, agencyId: undefined }))
  }
  
  const handleSavePackage = async (): Promise<void> => {
    const errors = validatePackageForm(packageData)
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setAlertState({ success: false, error: "Please correct the form errors." })
      window.scrollTo(0, 0)
      return
    }
    
    try {
      setLoadingState(prev => ({ ...prev, isSaving: true }))
      setAlertState({ success: false, error: "" })
      
      // Create update payload that matches the expected Firebase function signature
      const updatePayload = {
        title: packageData.title,
        description: packageData.description,
        price: Number(packageData.price),
        duration: Number(packageData.duration),
        groupSize: packageData.groupSize !== null ? Number(packageData.groupSize) : null,
        startDate: packageData.startDate,
        endDate: packageData.endDate,
        location: packageData.location,
        inclusions: packageData.inclusions,
        exclusions: packageData.exclusions,
        itinerary: packageData.itinerary,
        agencyId: packageData.agencyId || undefined, // Convert null to undefined
        agencyName: packageData.agencyName,
        isAdminPackage: packageData.isAdminPackage,
        status: packageData.status,
        updatedAt: new Date(),
        updatedBy: user?.uid,
      }
      
      await updatePackage(packageId, updatePayload)
      
      await sendDiscordWebhook({
        title: "Package Updated by Admin",
        description: `Admin has updated a package: ${packageData.title}`,
        fields: [
          { name: "Package", value: packageData.title },
          { name: "Price", value: `₦${packageData.price}` },
          { name: "Agency", value: packageData.isAdminPackage ? "Almutamir" : packageData.agencyName },
        ],
        color: 0x00aaff,
      })
      
      setAlertState({ success: true, error: "" })
      setFormErrors({})
      window.scrollTo(0, 0)
    } catch (error: any) {
      console.error("Error updating package:", error)
      setAlertState({
        success: false,
        error: error.message || "Failed to update package. Please try again.",
      })
      window.scrollTo(0, 0)
    } finally {
      setLoadingState(prev => ({ ...prev, isSaving: false }))
    }
  }
  
  const handleCancel = (): void => {
    router.push("/dashboard/admin/packages")
  }
  
  if (loadingState.isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]} requiredRole="admin">
        <DashboardLayout userType="admin">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }
  
  const hasAgencyChanged = originalAgencyId !== (packageData.isAdminPackage ? "admin" : packageData.agencyId)
  
  return (
    <ProtectedRoute allowedRoles={["admin"]} requiredRole="admin">
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleCancel} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Packages
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Package</h1>
                <p className="text-muted-foreground">Update package details</p>
              </div>
            </div>
            <Button onClick={handleSavePackage} disabled={loadingState.isSaving}>
              {loadingState.isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          
          {/* Alerts */}
          {alertState.success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Package has been updated successfully.</AlertDescription>
            </Alert>
          )}
          
          {alertState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{alertState.error}</AlertDescription>
            </Alert>
          )}
          
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agency Selection */}
              <div>
                <Label htmlFor="agency" className="mb-2 block">
                  Package Owner
                </Label>
                <Select
                  value={packageData.isAdminPackage ? "admin" : (packageData.agencyId || "")}
                  onValueChange={handleAgencySelect}
                >
                  <SelectTrigger id="agency">
                    <SelectValue placeholder="Select agency or Almutamir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Almutamir (Admin Package)</SelectItem>
                    <SelectItem value="divider" disabled>
                      ────────────────────────────
                    </SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.uid || agency.id} value={agency.uid || agency.id || ''}>
                        {getAgencyDisplayName(agency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasAgencyChanged && (
                  <p className="text-amber-600 text-sm mt-1">
                    Warning: Changing the package owner will transfer this package to another agency.
                  </p>
                )}
              </div>
              
              {/* Title and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">
                    Package Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={packageData.title}
                    onChange={(e) => updatePackageField("title", e.target.value)}
                    className={cn(formErrors.title && "border-red-500")}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location" className="mb-2 block">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={packageData.location}
                    onChange={(e) => updatePackageField("location", e.target.value)}
                    className={cn(formErrors.location && "border-red-500")}
                  />
                  {formErrors.location && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={packageData.description}
                  onChange={(e) => updatePackageField("description", e.target.value)}
                  className={cn(formErrors.description && "border-red-500")}
                  rows={3}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>
              
              {/* Price, Duration, Group Size */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="mb-2 block">
                    Price (₦) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={packageData.price}
                    onChange={(e) => updatePackageField("price", Number(e.target.value))}
                    className={cn(formErrors.price && "border-red-500")}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="duration" className="mb-2 block">
                    Duration (days) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={packageData.duration}
                    onChange={(e) => updatePackageField("duration", Number(e.target.value))}
                    className={cn(formErrors.duration && "border-red-500")}
                  />
                  {formErrors.duration && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="groupSize" className="mb-2 block">
                    Group Size
                  </Label>
                  <Input
                    id="groupSize"
                    type="number"
                    value={packageData.groupSize === null ? '' : packageData.groupSize}
                    onChange={(e) => updatePackageField("groupSize", Number(e.target.value) || null)}
                  />
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !packageData.startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {packageData.startDate instanceof Date 
                          ? format(packageData.startDate, "PPP") 
                          : <span>Pick a date</span>
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={packageData.startDate instanceof Date ? packageData.startDate : undefined}
                        onSelect={(date) => updatePackageField("startDate", date)}
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
                          !packageData.endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {packageData.endDate instanceof Date 
                          ? format(packageData.endDate, "PPP") 
                          : <span>Pick a date</span>
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={packageData.endDate instanceof Date ? packageData.endDate : undefined}
                        onSelect={(date) => updatePackageField("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Inclusions */}
              <div>
                <Label htmlFor="inclusions" className="mb-2 block">
                  Inclusions
                </Label>
                <Textarea
                  id="inclusions"
                  value={packageData.inclusions}
                  onChange={(e) => updatePackageField("inclusions", e.target.value)}
                  placeholder="What's included in the package? (e.g., accommodation, meals, transportation)"
                  rows={3}
                />
              </div>
              
              {/* Exclusions */}
              <div>
                <Label htmlFor="exclusions" className="mb-2 block">
                  Exclusions
                </Label>
                <Textarea
                  id="exclusions"
                  value={packageData.exclusions}
                  onChange={(e) => updatePackageField("exclusions", e.target.value)}
                  placeholder="What's not included in the package? (e.g., flights, visa fees)"
                  rows={3}
                />
              </div>
              
              {/* Itinerary */}
              <div>
                <Label htmlFor="itinerary" className="mb-2 block">
                  Itinerary
                </Label>
                <Textarea
                  id="itinerary"
                  value={packageData.itinerary}
                  onChange={(e) => updatePackageField("itinerary", e.target.value)}
                  placeholder="Day-by-day breakdown of activities"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSavePackage} disabled={loadingState.isSaving}>
              {loadingState.isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}