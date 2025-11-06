"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAgency } from "@/lib/firebase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building2, Check } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { sendWebhook } from "@/lib/webhooks"

export default function CreateAgencyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Agency Details
    description: "",
    phoneNumber: "",
    website: "",

    // Location
    address: "",
    city: "",
    state: "",
    country: "Nigeria",

    // Additional Info
    yearsInOperation: "",
    servicesOffered: [],
    pilgrimsServed: "",
    verified: false,
  })

  // Form validation
type FormErrors = {
  [key: string]: string | null | undefined;
  // You can also list specific known properties for better auto-completion
  // For example, if you know your form has 'name' and 'email' fields:
  name?: string | null;
  email?: string | null;
};

  const [errors, setErrors] = useState<FormErrors>({});

  const updateForm = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    })

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      })
    }
  }

  const validateStep = (stepNumber: number) => {
    const newErrors: FormErrors = {}

    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = "Agency name is required"
      if (!formData.email.trim()) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

      if (!formData.password) newErrors.password = "Password is required"
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"

      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    }

    if (stepNumber === 2) {
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
      if (!formData.country.trim()) newErrors.country = "Country is required"
      if (!formData.city.trim()) newErrors.city = "City is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const moveToNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const moveToPreviousStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!validateStep(step)) {
      return
    }

    try {
      setLoading(true)

      // Prepare agency data
      const agencyData = {
    agencyName: formData.name,
    email: formData.email,
    password: formData.password,
    phoneNumber: formData.phoneNumber,
    description: formData.description,
    website: formData.website,
    address: formData.address,
    cityOfOperation: formData.city,
    stateOfOperation: formData.state,
    countryOfOperation: formData.country,
    yearsInOperation: formData.yearsInOperation,
    servicesOffered: formData.servicesOffered,
    pilgrimsServed: formData.pilgrimsServed,
    verified: formData.verified,
    role: "agency",
    createdAt: new Date(),
    onboardingCompleted: true, // Required by type, but global enforcement is via middleware
      }

      // Create agency
      const agencyId = await createAgency(agencyData)

      if (!agencyId) {
        throw new Error("Failed to create agency. Please try again.")
      }

      // Send webhook notification
      const webhookUrl = "https://discordapp.com/api/webhooks/1374112883260002304/LR9DEcBQPEl2OQ6AWVS9JNUQlZaXt2os3o54zCTD8iIgYDoUYhmrEjD1-2Do099xw7SB"
      await sendWebhook(webhookUrl, {
        title: "New Agency Created",
        description: `Admin has created a new agency: ${formData.name}`,
        fields: [
          { name: "Agency Name", value: formData.name },
          { name: "Email", value: formData.email },
          { name: "Status", value: formData.verified ? "Verified" : "Unverified" },
        ],
        color: 0x00ff00,
      })

      toast({
        title: "Agency Created",
        description: "The agency has been successfully created.",
        variant: "default",
      })

      // Navigate to agency management page
      router.push("/dashboard/admin/agencies/manage")
    } catch (error: any) {
      console.error("Error creating agency:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create agency. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute  allowedRoles={["admin"]} requiredRole="admin">
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Create Agency</h1>
              <p className="text-muted-foreground">Add a new travel agency to the platform</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard/admin/agencies/manage")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agencies
            </Button>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Create New Agency
              </CardTitle>
              <CardDescription>Fill in the details to create a new travel agency account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                    </div>
                    <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Basic Info</span>
                  </div>
                  <div className="h-px w-12 bg-muted"></div>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > 2 ? <Check className="h-5 w-5" /> : "2"}
                    </div>
                    <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Agency Details</span>
                  </div>
                  <div className="h-px w-12 bg-muted"></div>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > 3 ? <Check className="h-5 w-5" /> : "3"}
                    </div>
                    <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Verification</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Agency Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => updateForm("name", e.target.value)}
                          placeholder="Enter agency name"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="Enter email address"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">
                            Password <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => updateForm("password", e.target.value)}
                            placeholder="Enter password"
                            className={errors.password ? "border-red-500" : ""}
                          />
                          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm Password <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateForm("confirmPassword", e.target.value)}
                            placeholder="Confirm password"
                            className={errors.confirmPassword ? "border-red-500" : ""}
                          />
                          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-right">
                      <Button type="button" onClick={moveToNextStep}>
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Agency Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => updateForm("description", e.target.value)}
                          placeholder="Enter a detailed description of the agency"
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) => updateForm("phoneNumber", e.target.value)}
                            placeholder="Enter phone number"
                            className={errors.phoneNumber ? "border-red-500" : ""}
                          />
                          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => updateForm("website", e.target.value)}
                            placeholder="Enter agency website"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Office Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateForm("address", e.target.value)}
                          placeholder="Enter office address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">
                            Country <span className="text-red-500">*</span>
                          </Label>
                          <Select value={formData.country} onValueChange={(value) => updateForm("country", value)}>
                            <SelectTrigger id="country" className={errors.country ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                              <SelectItem value="Ghana">Ghana</SelectItem>
                              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                              <SelectItem value="Egypt">Egypt</SelectItem>
                              <SelectItem value="Morocco">Morocco</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">
                            City <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => updateForm("city", e.target.value)}
                            placeholder="Enter city"
                            className={errors.city ? "border-red-500" : ""}
                          />
                          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => updateForm("state", e.target.value)}
                            placeholder="Enter state or province"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={moveToPreviousStep}>
                        Back
                      </Button>
                      <Button type="button" onClick={moveToNextStep}>
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="yearsInOperation">Years in Operation</Label>
                          <Input
                            id="yearsInOperation"
                            type="number"
                            value={formData.yearsInOperation}
                            onChange={(e) => updateForm("yearsInOperation", e.target.value)}
                            placeholder="How many years in business"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pilgrimsServed">Pilgrims Served Annually</Label>
                          <Input
                            id="pilgrimsServed"
                            type="number"
                            value={formData.pilgrimsServed}
                            onChange={(e) => updateForm("pilgrimsServed", e.target.value)}
                            placeholder="Average number of pilgrims per year"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.verified}
                            onChange={(e) => updateForm("verified", e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span>Verify this agency immediately</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Verified agencies will have a green badge on their profile and their packages will be visible
                          to the public.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={moveToPreviousStep}>
                        Back
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Agency"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
