"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { updateUserOnboardingData, getUserData } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Stepper, type Step } from "@/components/ui/stepper"
import { useMediaQuery } from "@/hooks/use-media-query"

interface FormData {
  firstName: string
  lastName: string
  email: string
  agencyName: string
  description: string
  address: string
  phoneNumber: string
  alternativeEmail: string
  countryOfOperation: string
  cityOfOperation: string
  servicesOffered: {
    ticketing: boolean
    visaProcessing: boolean
    accommodation: boolean
    feeding: boolean
    localTransportation: boolean
    touristGuide: boolean
  }
}

export default function AgencyOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.displayName?.split(" ")[0] || "",
    lastName: user?.displayName?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    agencyName: "",
    description: "",
    address: "",
    phoneNumber: "",
    alternativeEmail: "",
    countryOfOperation: "",
    cityOfOperation: "",
    servicesOffered: {
      ticketing: false,
      visaProcessing: false,
      accommodation: false,
      feeding: false,
      localTransportation: false,
      touristGuide: false,
    },
  })

  const steps: Step[] = [
    {
      id: 1,
      title: "Agency Information",
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending",
    },
    {
      id: 2,
      title: "Contact Details",
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending",
    },
    {
      id: 3,
      title: "Services Offered",
      status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "pending",
    },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userData = (await getUserData(user.uid)) as any
          if (userData) {
            setFormData((prev) => ({
              ...prev,
              firstName: userData.firstName || prev.firstName,
              lastName: userData.lastName || prev.lastName,
              email: userData.email || prev.email,
              agencyName: userData.agencyName || "",
              description: userData.description || "",
              address: userData.address || "",
              phoneNumber: userData.phoneNumber || "",
              alternativeEmail: userData.alternativeEmail || "",
              countryOfOperation: userData.countryOfOperation || "",
              cityOfOperation: userData.cityOfOperation || "",
              servicesOffered: userData.servicesOffered || prev.servicesOffered,
            }))
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }
    fetchUserData()
  }, [user?.uid])

  const handleChange = (field: keyof Omit<FormData, "servicesOffered">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleServiceChange = (service: keyof FormData["servicesOffered"]) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: {
        ...prev.servicesOffered,
        [service]: !prev.servicesOffered[service],
      },
    }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const payload: any = {
        ...formData,
        onboardingCompleted: true,
      }

      // Ensure numeric fields have correct types expected by Firestore helper
      if (payload.averagePilgrimsPerYear && typeof payload.averagePilgrimsPerYear === "string") {
        const num = parseInt(payload.averagePilgrimsPerYear as string, 10)
        payload.averagePilgrimsPerYear = isNaN(num) ? undefined : num
      }

      // Show progress toast
      toast({
        title: "Saving",
        description: "Setting up your agency...",
      })

      await updateUserOnboardingData(user.uid, payload)

      // Show success toast
      toast({
        title: "Success",
        description: "Agency setup completed!",
      })

      // Set onboarding cookie so middleware knows onboarding is done
      document.cookie = `onboarding-completed=true; path=/; max-age=86400`

      // Wait a moment for cookie to be written, then redirect
      setTimeout(() => {
        window.location.href = "/dashboard/agency"
      }, 500)
    } catch (error) {
      console.error("Error updating user data:", error)
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name *</Label>
              <Input
                id="agencyName"
                value={formData.agencyName || ""}
                onChange={(e) => handleChange("agencyName", e.target.value)}
                placeholder="Enter your agency name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of your agency"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Office address"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countryOfOperation">Country of Operation *</Label>
                <Input
                  id="countryOfOperation"
                  value={formData.countryOfOperation || ""}
                  onChange={(e) => handleChange("countryOfOperation", e.target.value)}
                  placeholder="Enter country"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cityOfOperation">City of Operation *</Label>
                <Input
                  id="cityOfOperation"
                  value={formData.cityOfOperation || ""}
                  onChange={(e) => handleChange("cityOfOperation", e.target.value)}
                  placeholder="Enter city"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternativeEmail">Alternative Email</Label>
                <Input
                  id="alternativeEmail"
                  type="email"
                  value={formData.alternativeEmail || ""}
                  onChange={(e) => handleChange("alternativeEmail", e.target.value)}
                  placeholder="Alternative email"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Services Offered</h3>
            <p className="text-sm text-gray-600">Select all services your agency provides</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="ticketing"
                  checked={formData.servicesOffered.ticketing}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicesOffered: { ...prev.servicesOffered, ticketing: checked as boolean },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="ticketing" className="font-normal cursor-pointer">
                  Ticketing
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="visaProcessing"
                  checked={formData.servicesOffered.visaProcessing}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicesOffered: { ...prev.servicesOffered, visaProcessing: checked as boolean },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="visaProcessing" className="font-normal cursor-pointer">
                  Visa Processing
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="accommodation"
                  checked={formData.servicesOffered.accommodation}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicesOffered: { ...prev.servicesOffered, accommodation: checked as boolean },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="accommodation" className="font-normal cursor-pointer">
                  Accommodation
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="feeding"
                  checked={formData.servicesOffered.feeding}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicesOffered: { ...prev.servicesOffered, feeding: checked as boolean },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="feeding" className="font-normal cursor-pointer">
                  Feeding
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="localTransportation"
                  checked={formData.servicesOffered.localTransportation}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicesOffered: { ...prev.servicesOffered, localTransportation: checked as boolean },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="localTransportation" className="font-normal cursor-pointer">
                  Local Transportation
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="touristGuide"
                  checked={formData.servicesOffered.touristGuide}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicesOffered: { ...prev.servicesOffered, touristGuide: checked as boolean },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="touristGuide" className="font-normal cursor-pointer">
                  Tourist Guide
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Your Agency Profile</h1>
        <p className="text-gray-500">Tell us more about your agency to better serve pilgrims</p>
      </div>

      <div className="md:block hidden">
        <Stepper steps={steps} orientation="horizontal" />
      </div>

      <div className="md:hidden block">
        <Stepper steps={steps} orientation="vertical" />
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>

            {currentStep < 3 ? (
              <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]" onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="bg-[#c8e823] text-black hover:bg-[#b5d31f]"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#014034" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="#014034" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
