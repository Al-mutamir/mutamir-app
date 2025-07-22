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
  agencyName: string
  managerName: string
  countryOfOperation: string
  cityOfOperation: string
  phoneNumber: string
  alternativeEmail: string
  averagePilgrimsPerYear: string
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
  const [formData, setFormData] = useState<FormData>({
    agencyName: "",
    managerName: user?.displayName || "",
    countryOfOperation: "",
    cityOfOperation: "",
    phoneNumber: "",
    alternativeEmail: "",
    averagePilgrimsPerYear: "",
    servicesOffered: {
      ticketing: false,
      visaProcessing: false,
      accommodation: false,
      feeding: false,
      localTransportation: false,
      touristGuide: false,
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    // Check if user has already started onboarding
    const fetchUserData = async () => {
      if (user?.uid) {
        const userData = await getUserData(user.uid)
        if (userData) {
          // Pre-fill the form with existing data if available
          setFormData({
            agencyName: userData.agencyName || "",
            managerName: userData.managerName || user?.displayName || "",
            countryOfOperation: userData.countryOfOperation || "",
            cityOfOperation: userData.cityOfOperation || "",
            phoneNumber: userData.phoneNumber || "",
            alternativeEmail: userData.alternativeEmail || "",
            averagePilgrimsPerYear: userData.averagePilgrimsPerYear?.toString() || "",
            servicesOffered: userData.servicesOffered || {
              ticketing: false,
              visaProcessing: false,
              accommodation: false,
              feeding: false,
              localTransportation: false,
              touristGuide: false,
            },
          })
        }
      }
    }

    fetchUserData()
  }, [user])

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
      await updateUserOnboardingData(user.uid, {
        agencyName: formData.agencyName,
        managerName: formData.managerName,
        countryOfOperation: formData.countryOfOperation,
        cityOfOperation: formData.cityOfOperation,
        phoneNumber: formData.phoneNumber,
        alternativeEmail: formData.alternativeEmail,
        averagePilgrimsPerYear: Number.parseInt(formData.averagePilgrimsPerYear),
        servicesOffered: formData.servicesOffered,
        onboardingCompleted: true,
      })

      toast({
        title: "Onboarding completed!",
        description: "Your agency profile has been set up successfully.",
        duration: 3000,
      })

      // Redirect to agency dashboard
      router.replace("/dashboard/agency")
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
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => handleChange("agencyName", e.target.value)}
                placeholder="Enter your agency name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerName">Manager Name</Label>
              <Input
                id="managerName"
                value={formData.managerName}
                onChange={(e) => handleChange("managerName", e.target.value)}
                placeholder="Enter manager name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countryOfOperation">Country of Operation</Label>
                <Select
                  value={formData.countryOfOperation}
                  onValueChange={(value) => handleChange("countryOfOperation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="UAE">United Arab Emirates</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cityOfOperation">City of Operation</Label>
                <Input
                  id="cityOfOperation"
                  value={formData.cityOfOperation}
                  onChange={(e) => handleChange("cityOfOperation", e.target.value)}
                  placeholder="Enter your city"
                  required
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternativeEmail">Alternative Email</Label>
              <Input
                id="alternativeEmail"
                type="email"
                value={formData.alternativeEmail}
                onChange={(e) => handleChange("alternativeEmail", e.target.value)}
                placeholder="Enter alternative email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averagePilgrimsPerYear">Average Number of Pilgrims Per Year</Label>
              <Input
                id="averagePilgrimsPerYear"
                type="number"
                value={formData.averagePilgrimsPerYear}
                onChange={(e) => handleChange("averagePilgrimsPerYear", e.target.value)}
                placeholder="Enter average number of pilgrims"
                required
                min="0"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Services Offered</Label>
              <p className="text-sm text-gray-500">Select all the services your agency provides</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ticketing"
                    checked={formData.servicesOffered.ticketing}
                    onCheckedChange={() => handleServiceChange("ticketing")}
                  />
                  <Label htmlFor="ticketing">Ticketing</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visaProcessing"
                    checked={formData.servicesOffered.visaProcessing}
                    onCheckedChange={() => handleServiceChange("visaProcessing")}
                  />
                  <Label htmlFor="visaProcessing">Visa Processing</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accommodation"
                    checked={formData.servicesOffered.accommodation}
                    onCheckedChange={() => handleServiceChange("accommodation")}
                  />
                  <Label htmlFor="accommodation">Accommodation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="feeding"
                    checked={formData.servicesOffered.feeding}
                    onCheckedChange={() => handleServiceChange("feeding")}
                  />
                  <Label htmlFor="feeding">Feeding</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="localTransportation"
                    checked={formData.servicesOffered.localTransportation}
                    onCheckedChange={() => handleServiceChange("localTransportation")}
                  />
                  <Label htmlFor="localTransportation">Local Transportation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="touristGuide"
                    checked={formData.servicesOffered.touristGuide}
                    onCheckedChange={() => handleServiceChange("touristGuide")}
                  />
                  <Label htmlFor="touristGuide">Tourist Guide</Label>
                </div>
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
