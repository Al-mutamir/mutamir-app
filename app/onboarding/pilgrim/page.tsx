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
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Stepper, type Step } from "@/components/ui/stepper"
import { useMediaQuery } from "@/hooks/use-media-query"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: "male" | "female" | ""
  passportNumber: string
  passportUpload?: string
  nextOfKinFirstName: string
  nextOfKinLastName: string
  nextOfKinPhone: string
  nextOfKinEmail: string
}

export default function PilgrimOnboarding() {
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
    phone: "",
    gender: "",
    passportNumber: "",
    nextOfKinFirstName: "",
    nextOfKinLastName: "",
    nextOfKinPhone: "",
    nextOfKinEmail: "",
  })

  const steps: Step[] = [
    {
      id: 1,
      title: "Personal Details",
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending",
    },
    {
      id: 2,
      title: "Travel Information",
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending",
    },
    {
      id: 3,
      title: "Security",
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
              phone: userData.phone || userData.phoneNumber || "",
              gender: userData.gender || "",
              passportNumber: userData.passportNumber || "",
              nextOfKinFirstName: userData.nextOfKinFirstName || "",
              nextOfKinLastName: userData.nextOfKinLastName || "",
              nextOfKinPhone: userData.nextOfKinPhone || "",
              nextOfKinEmail: userData.nextOfKinEmail || "",
            }))
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }
    fetchUserData()
  }, [user?.uid])

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      toast({
        title: "Saving",
        description: "Saving your profile...",
      })

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        gender: formData.gender || undefined,
        passportNumber: formData.passportNumber,
        nextOfKinFirstName: formData.nextOfKinFirstName,
        nextOfKinLastName: formData.nextOfKinLastName,
        nextOfKinPhone: formData.nextOfKinPhone,
        nextOfKinEmail: formData.nextOfKinEmail,
        onboardingCompleted: true,
      }

      await updateUserOnboardingData(user.uid, payload)

      toast({
        title: "Success",
        description: "Profile completed!",
      })

      // Set cookie
      document.cookie = `onboarding-completed=true; path=/; max-age=86400`

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard/pilgrim"
      }, 500)
    } catch (error: any) {
      console.error("Error:", error)
      setIsSubmitting(false)
      toast({
        title: "Error",
        description: error?.message || "Failed to save your information. Please try again.",
        variant: "destructive",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
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
                  value={formData.lastName}
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
                value={formData.email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone number"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)} disabled={isSubmitting}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number *</Label>
              <Input
                id="passportNumber"
                value={formData.passportNumber}
                onChange={(e) => handleChange("passportNumber", e.target.value)}
                placeholder="Enter passport number"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Passport upload temporarily deactivated */}
            <div className="space-y-2">
              <Label htmlFor="passportUpload">Passport Upload</Label>
              <Input
                id="passportUpload"
                type="file"
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Passport upload is temporarily disabled.</p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Next of Kin Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nokFirstName">First Name *</Label>
                <Input
                  id="nokFirstName"
                  value={formData.nextOfKinFirstName}
                  onChange={(e) => handleChange("nextOfKinFirstName", e.target.value)}
                  placeholder="First name"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nokLastName">Last Name *</Label>
                <Input
                  id="nokLastName"
                  value={formData.nextOfKinLastName}
                  onChange={(e) => handleChange("nextOfKinLastName", e.target.value)}
                  placeholder="Last name"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nokPhone">Phone Number *</Label>
                <Input
                  id="nokPhone"
                  type="tel"
                  value={formData.nextOfKinPhone}
                  onChange={(e) => handleChange("nextOfKinPhone", e.target.value)}
                  placeholder="Phone number"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nokEmail">Email *</Label>
                <Input
                  id="nokEmail"
                  type="email"
                  value={formData.nextOfKinEmail}
                  onChange={(e) => handleChange("nextOfKinEmail", e.target.value)}
                  placeholder="Email"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Complete Your Profile</h1>
          <p className="text-slate-600">Step {currentStep} of 3 - {steps[currentStep - 1]?.title}</p>
        </div>

        {/* Desktop Stepper */}
        {!isMobile && (
          <div className="hidden md:block">
            <Stepper steps={steps} orientation="horizontal" />
          </div>
        )}

        {/* Mobile Stepper */}
        {isMobile && (
          <div className="md:hidden block">
            <Stepper steps={steps} orientation="vertical" />
          </div>
        )}

        {/* Form Card */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
