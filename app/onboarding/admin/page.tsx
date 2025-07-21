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
import { ArrowLeft, ArrowRight, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Stepper, type Step } from "@/components/ui/stepper"
import { useMediaQuery } from "@/hooks/use-media-query"

interface FormData {
  fullName: string
  department: string
  position: string
  phoneNumber: string
  adminRole: string
}

export default function AdminOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.displayName || "",
    department: "",
    position: "",
    phoneNumber: "",
    adminRole: "",
  })

  const steps: Step[] = [
    {
      id: 1,
      title: "Personal Information",
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending",
    },
    {
      id: 2,
      title: "Role Selection",
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending",
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
            fullName: userData.fullName || user?.displayName || "",
            department: userData.department || "",
            position: userData.position || "",
            phoneNumber: userData.phoneNumber || "",
            adminRole: userData.adminRole || "",
          })
        }
      }
    }

    fetchUserData()
  }, [user])

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const nextStep = () => {
    if (currentStep < 2) {
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
        fullName: formData.fullName,
        department: formData.department,
        position: formData.position,
        phoneNumber: formData.phoneNumber,
        adminRole: formData.adminRole,
        role: "admin",
        onboardingCompleted: true,
      })

      toast({
        title: "Onboarding completed!",
        description: "Your admin profile has been set up successfully.",
        duration: 3000,
      })

      // Redirect to admin dashboard
      router.replace("/dashboard/admin")
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                placeholder="Enter your position"
                required
              />
            </div>

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
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adminRole">Admin Role</Label>
              <Select value={formData.adminRole} onValueChange={(value) => handleChange("adminRole", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your admin role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="agent_management">Agent Management</SelectItem>
                  <SelectItem value="package_management">Package Management</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                This determines your access level and permissions within the admin dashboard.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Admin Responsibilities</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    <strong>Finance:</strong> Manage payments and financial transactions.
                    <br />
                    <strong>Agent Management:</strong> Create, verify, and manage agencies.
                    <br />
                    <strong>Package Management:</strong> Create and manage travel packages.
                  </p>
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
        <h1 className="text-3xl font-bold mb-2">Admin Onboarding</h1>
        <p className="text-gray-500">Complete your profile to access the admin dashboard</p>
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

            {currentStep < 2 ? (
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
