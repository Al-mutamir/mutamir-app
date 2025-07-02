"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PackageReview from "@/components/package-review"

export default function GetStartedPage() {
  const [step, setStep] = useState(1)
  const [packageType, setPackageType] = useState("hajj")
  const [selectedServices, setSelectedServices] = useState({
    visa: false,
    flight: false,
    accommodation: false,
    transport: false,
    food: false,
  })
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    city: "",
    passport: "",
    departureCity: "",
  })

  const handleServiceChange = (service: string) => {
    setSelectedServices({
      ...selectedServices,
      [service]: !selectedServices[service as keyof typeof selectedServices],
    })
  }

  const handlePersonalDetailChange = (field: string, value: string) => {
    setPersonalDetails({
      ...personalDetails,
      [field]: value,
    })
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Your Package</h2>
            <Tabs defaultValue="hajj" onValueChange={(value) => setPackageType(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hajj">Hajj</TabsTrigger>
                <TabsTrigger value="umrah">Umrah</TabsTrigger>
              </TabsList>
              <TabsContent value="hajj" className="space-y-4 pt-4">
                <div className="bg-[#f0f9d4] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Hajj Package</h3>
                  <p className="text-gray-600">
                    The annual Islamic pilgrimage to Mecca, Saudi Arabia, which takes place during Dhu al-Hijjah, the
                    last month of the Islamic calendar.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="umrah" className="space-y-4 pt-4">
                <div className="bg-[#f0f9d4] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Umrah Package</h3>
                  <p className="text-gray-600">
                    The non-mandatory lesser pilgrimage to Mecca that can be performed at any time of the year.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <h3 className="font-semibold">Select Services</h3>
              <p className="text-gray-600">Choose the services you need for your journey</p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visa"
                    checked={selectedServices.visa}
                    onCheckedChange={() => handleServiceChange("visa")}
                  />
                  <Label htmlFor="visa">Visa Assistance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flight"
                    checked={selectedServices.flight}
                    onCheckedChange={() => handleServiceChange("flight")}
                  />
                  <Label htmlFor="flight">Flight Booking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accommodation"
                    checked={selectedServices.accommodation}
                    onCheckedChange={() => handleServiceChange("accommodation")}
                  />
                  <Label htmlFor="accommodation">Accommodation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transport"
                    checked={selectedServices.transport}
                    onCheckedChange={() => handleServiceChange("transport")}
                  />
                  <Label htmlFor="transport">Local Transportation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="food"
                    checked={selectedServices.food}
                    onCheckedChange={() => handleServiceChange("food")}
                  />
                  <Label htmlFor="food">Meals</Label>
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Personal Details</h2>
            <p className="text-gray-600">Please provide your information for the pilgrimage</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personalDetails.firstName}
                  onChange={(e) => handlePersonalDetailChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalDetails.lastName}
                  onChange={(e) => handlePersonalDetailChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalDetails.email}
                onChange={(e) => handlePersonalDetailChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={personalDetails.phone}
                onChange={(e) => handlePersonalDetailChange("phone", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={personalDetails.country}
                  onValueChange={(value) => handlePersonalDetailChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={personalDetails.city}
                  onChange={(e) => handlePersonalDetailChange("city", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport">Passport Number</Label>
              <Input
                id="passport"
                value={personalDetails.passport}
                onChange={(e) => handlePersonalDetailChange("passport", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureCity">Departure City</Label>
              <Input
                id="departureCity"
                value={personalDetails.departureCity}
                onChange={(e) => handlePersonalDetailChange("departureCity", e.target.value)}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Your Package</h2>
            <p className="text-gray-600">Please review your selections before submitting</p>

            <PackageReview packageType={packageType} services={selectedServices} personalDetails={personalDetails} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <MapPin className="h-6 w-6 text-[#c8e823]" />
            <span className="text-xl font-bold">MUTAMIR</span>
          </Link>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Plan Your Journey</h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-[#c8e823]" : "bg-gray-300"}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-[#c8e823]" : "bg-gray-300"}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 3 ? "bg-[#c8e823]" : "bg-gray-300"}`}></div>
            </div>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 md:p-10">
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]" onClick={() => window.print()}>
                  Print Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
