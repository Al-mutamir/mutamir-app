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
  address: string
  city: string
  state: string
  country: string
  dateOfBirth: string
  gender: string
  passportNumber: string
  passportExpiry: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    language: string
  }
}

export default function PilgrimOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    passportExpiry: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      marketingEmails: false,
      language: "en",
    },
  })

  const steps: Step[] = [
    {
      id: 1,
      title: "Personal Information",
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending",
    },
    {
      id: 2,
      title: "Contact Details",
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending",
    },
    {
      id: 3,
      title: "Travel Information",
      status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "pending",
    },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const userData = await getUserData(user.uid)
        if (userData) {
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || user.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            country: userData.country || "Nigeria",
            dateOfBirth: userData.dateOfBirth || "",
            gender: userData.gender || "",
            passportNumber: userData.passportNumber || "",
            passportExpiry: userData.passportExpiry || "",
            emergencyContact: {
              name: userData.emergencyContact?.name || "",
              relationship: userData.emergencyContact?.relationship || "",
              phone: userData.emergencyContact?.phone || "",
            },
            preferences: {
              emailNotifications: userData.preferences?.emailNotifications ?? true,
              smsNotifications: userData.preferences?.smsNotifications ?? true,
              marketingEmails: userData.preferences?.marketingEmails ?? false,
              language: userData.preferences?.language || "en",
            },
          })
        }
      }
    }

    fetchUserData()
  }, [user])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".")
      if (keys.length === 1) {
        return { ...prev, [field]: value }
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev],
            [keys[1]]: value,
          },
        }
      } else {
        // For deeper nesting if needed
        return prev
      }
    })
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

    try {
      await updateUserOnboardingData(user.uid, {
        ...formData,
        onboardingCompleted: true,
      })

      toast({
        title: "Onboarding completed!",
        description: "Your profile has been set up successfully.",
        duration: 3000,
      })

      // Redirect to pilgrim dashboard
      router.replace("/dashboard/pilgrim")
    } catch (error) {
      console.error("Error updating user data:", error)
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Enter your state"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleChange("country", value)}
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
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  placeholder="Select your date of birth"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContact.name}
                onChange={(e) => handleChange("emergencyContact.name", e.target.value)}
                placeholder="Enter emergency contact's name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">Relationship</Label>
              <Input
                id="emergencyContactRelationship"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleChange("emergencyContact.relationship", e.target.value)}
                placeholder="Enter your relationship with the emergency contact"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleChange("emergencyContact.phone", e.target.value)}
                placeholder="Enter emergency contact's phone number"
                required
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input
                id="passportNumber"
                value={formData.passportNumber}
                onChange={(e) => handleChange("passportNumber", e.target.value)}
                placeholder="Enter your passport number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
              <Input
                id="passportExpiry"
                type="date"
                value={formData.passportExpiry}
                onChange={(e) => handleChange("passportExpiry", e.target.value)}
                placeholder="Select your passport expiry date"
                required
              />
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
        <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-gray-500">Tell us more about yourself to personalize your pilgrimage experience</p>
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
              <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]" onClick={handleSubmit}>
                Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
