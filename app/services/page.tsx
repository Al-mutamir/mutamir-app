"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowRight, Plus, Trash2, Users, UserPlus, Info, Building, Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import PackageReview from "@/components/package-review"
import { Footer } from "@/components/footer"
import { createBooking } from "@/firebase/firestore" // <-- Add this import

// Import the utility functions
import { printElement } from "@/utils/print-utils"

interface PilgrimDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  passport: string
}

interface GroupMember {
  name: string
  email: string
  phone: string
}

export default function ServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get parameters from URL
  const initialPackageType = searchParams?.get("type") || "hajj"
  const initialPackage = searchParams?.get("package") || ""
  const initialDate = searchParams?.get("date") || ""
  const initialDeparture = searchParams?.get("departure") || ""
  const initialReturnDate = searchParams?.get("returnDate") || ""

  const [step, setStep] = useState(1)
  const [packageType, setPackageType] = useState(initialPackageType)
  const [selectedPackage, setSelectedPackage] = useState(initialPackage)
  const [departureDate, setDepartureDate] = useState(initialDate)
  const [returnDate, setReturnDate] = useState(initialReturnDate)
  const [departureCity, setDepartureCity] = useState(initialDeparture)
  const [isGroupBooking, setIsGroupBooking] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([{ name: "", email: "", phone: "" }])

  const [pilgrims, setPilgrims] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "Nigeria",
      city: "",
      passport: "",
    },
  ])

  const [selectedServices, setSelectedServices] = useState({
    visa: {
      selected: false,
      tier: "short-term",
      details: {},
    },
    flight: {
      selected: false,
      tier: "economy",
      details: {},
    },
    accommodation: {
      selected: false,
      tier: "standard",
      type: "hotel",
      proximity: "standard",
      details: {},
    },
    transport: {
      selected: false,
      tier: "shared",
      details: {},
    },
    food: {
      selected: false,
      tier: "standard",
      details: {},
    },
    visitation: {
      selected: false,
      tier: "standard",
      sites: [] as string[],
      details: {},
    },
  })

  // --- Replace the preferredItinerary state with an array ---
  const [preferredItinerary, setPreferredItinerary] = useState<string[]>([])

  // Handle service selection
  const handleServiceChange = (service: string, selected: boolean) => {
    setSelectedServices({
      ...selectedServices,
      [service]: {
        ...selectedServices[service as keyof typeof selectedServices],
        selected,
      },
    })
  }

  // Handle service tier selection
  const handleTierChange = (service: string, tier: string) => {
    setSelectedServices({
      ...selectedServices,
      [service]: {
        ...selectedServices[service as keyof typeof selectedServices],
        tier,
      },
    })
  }

  // Handle accommodation type selection
  const handleAccommodationTypeChange = (type: string) => {
    setSelectedServices({
      ...selectedServices,
      accommodation: {
        ...selectedServices.accommodation,
        type,
      },
    })
  }

  // Handle accommodation proximity selection
  const handleAccommodationProximityChange = (proximity: string) => {
    setSelectedServices({
      ...selectedServices,
      accommodation: {
        ...selectedServices.accommodation,
        proximity,
      },
    })
  }

  // Handle visitation site selection
  const handleVisitationSiteChange = (site: string, selected: boolean) => {
    const currentSites = (selectedServices.visitation.sites as string[]) || []
    let newSites

    if (selected) {
      newSites = [...currentSites, site]
    } else {
      newSites = currentSites.filter((s) => s !== site)
    }

    setSelectedServices({
      ...selectedServices,
      visitation: {
        ...selectedServices.visitation,
        sites: newSites,
      },
    })
  }

  // Handle pilgrim details change
  const handlePilgrimChange = (index: number, field: string, value: string) => {
    const updatedPilgrims = [...pilgrims]
    updatedPilgrims[index] = {
      ...updatedPilgrims[index],
      [field]: value,
    }
    setPilgrims(updatedPilgrims)
  }

  // Add a new pilgrim for group booking
  const addPilgrim = () => {
    setPilgrims([
      ...pilgrims,
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "Nigeria",
        city: "",
        passport: "",
      },
    ])
  }

  // Remove a pilgrim
  const removePilgrim = (index: number) => {
    if (pilgrims.length > 1) {
      const updatedPilgrims = [...pilgrims]
      updatedPilgrims.splice(index, 1)
      setPilgrims(updatedPilgrims)
    }
  }

  // Handle group member change
  const handleGroupMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...groupMembers]
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    }
    setGroupMembers(updatedMembers)
  }

  // Add a new group member
  const addGroupMember = () => {
    setGroupMembers([
      ...groupMembers,
      {
        name: "",
        email: "",
        phone: "",
      },
    ])
  }

  // Remove a group member
  const removeGroupMember = (index: number) => {
    if (groupMembers.length > 1) {
      const updatedMembers = [...groupMembers]
      updatedMembers.splice(index, 1)
      setGroupMembers(updatedMembers)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  // --- Add this handler functions ---
  const handleAddItinerary = () => {
    setPreferredItinerary([...preferredItinerary, ""])
  }

  const handleRemoveItinerary = (index: number) => {
    const updated = [...preferredItinerary]
    updated.splice(index, 1)
    setPreferredItinerary(updated)
  }

  const handleItineraryChange = (index: number, value: string) => {
    const updated = [...preferredItinerary]
    updated[index] = value
    setPreferredItinerary(updated)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Store booking details in localStorage for the success page
    const bookingDetails = {
      packageType,
      selectedPackage,
      isGroupBooking,
      pilgrims,
      departureCity,
      departureDate,
      returnDate,
      preferredItinerary, // now an array
      services: selectedServices,
      isCreatingGroup,
      groupMembers,
    }

    try {
      // Save booking to Firestore (using the first pilgrim as the main contact)
      const mainPilgrim = pilgrims[0]
      await createBooking({
        packageId: selectedPackage || "custom",
        pilgrimId: mainPilgrim.email, // or use a user ID if available
        agencyId: "custom", // or set to the selected agency/package agency if available
        status: "pending",
        travelDate: departureDate,
        returnDate: returnDate,
        totalPrice: 0, // Set actual price if available
        paymentStatus: "unpaid",
        highlights: preferredItinerary,
        notes: "",
      })

      // Send confirmation email
      const emailRes = await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mainPilgrim.email,
          subject: "Your Al-mutamir Booking Confirmation",
          text: `Dear ${mainPilgrim.firstName},\n\nYour booking has been received. We will contact you soon.\n\nThank you for choosing Al-mutamir!`,
          html: `<p>Dear ${mainPilgrim.firstName},</p><p>Your booking has been received. We will contact you soon.</p><p>Thank you for choosing <b>Al-mutamir</b>!</p>`,
        }),
      })

      if (!emailRes.ok) {
        let errorText = ""
        try {
          errorText = await emailRes.text()
          // Try to parse as JSON, fallback to plain text
          try {
            const errorData = JSON.parse(errorText)
            console.error("Error sending confirmation email:", errorData.error)
          } catch {
            console.error("Error sending confirmation email (non-JSON):", errorText)
          }
        } catch (err) {
          console.error("Error reading error response:", err)
        }
      }
    } catch (e) {
      console.error("Failed to store booking details or send email:", e)
    }

    // Simulate API call
    setTimeout(() => {
      router.push("/services/success")
    }, 1500)
  }

  // Check if form is valid for current step
  const isCurrentStepValid = () => {
    if (step === 1) {
      // Validate step 1 - Package selection
      const selectedDate = new Date(departureDate)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      return departureCity !== "" && departureDate !== "" && selectedDate >= tomorrow
    } else if (step === 2) {
      // Validate step 2 - Personal details
      return pilgrims.every(
        (pilgrim) =>
          pilgrim.firstName !== "" &&
          pilgrim.lastName !== "" &&
          pilgrim.email !== "" &&
          pilgrim.phone !== "" &&
          pilgrim.country !== "" &&
          pilgrim.city !== "" &&
          pilgrim.passport !== "",
      )
    }
    return true
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Your Package</h2>
            <Tabs defaultValue={packageType} onValueChange={(value) => setPackageType(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hajj">Hajj</TabsTrigger>
                <TabsTrigger value="umrah">Umrah</TabsTrigger>
              </TabsList>
              <TabsContent value="hajj" className="space-y-4 pt-4">
                <div className="bg-[#f0f9d4] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Hajj Package</h3>
                  <p className="text-gray-600">
                    The annual Islamic pilgrimage to Mecca, Saudi Arabia, which takes place during Dhu al-Hijjah, the
                    last month of the Islamic calendar. Experience a deeply spiritual journey that fulfills one of the
                    five pillars of Islam.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="umrah" className="space-y-4 pt-4">
                <div className="bg-[#f0f9d4] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Umrah Package</h3>
                  <p className="text-gray-600">
                    The non-mandatory lesser pilgrimage to Mecca that can be performed at any time of the year. Embark
                    on a spiritually enriching journey that cleanses the soul and brings you closer to Allah.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="group-booking" checked={isGroupBooking} onCheckedChange={setIsGroupBooking} />
                  <Label htmlFor="group-booking">Group Booking (Multiple Pilgrims)</Label>
                </div>
                <p className="text-sm text-gray-500 ml-7">Enable this option if you're booking for multiple pilgrims</p>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-group"
                    checked={isCreatingGroup}
                    onCheckedChange={setIsCreatingGroup}
                    disabled={true}
                  />
                  <Label htmlFor="create-group" className="flex items-center">
                    Create a Group
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      Coming Soon
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            Create a group and invite others to join your pilgrimage. You'll be the group leader and can
                            manage the booking for everyone.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <p className="text-sm text-gray-500 ml-7">Create a group and invite others to join your pilgrimage</p>
              </div>

              {isCreatingGroup && (
                <div className="border p-4 rounded-lg space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Group Members</h3>
                    <Button variant="outline" size="sm" onClick={addGroupMember} className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" /> Add Member
                    </Button>
                  </div>

                  {groupMembers.map((member, index) => (
                    <div key={index} className="space-y-3 p-3 border rounded-md bg-white">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Member {index + 1}</h4>
                        {groupMembers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGroupMember(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`member-name-${index}`} className="text-xs">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`member-name-${index}`}
                          value={member.name}
                          onChange={(e) => handleGroupMemberChange(index, "name", e.target.value)}
                          placeholder="Full name"
                          className="h-8"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor={`member-email-${index}`} className="text-xs">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`member-email-${index}`}
                            value={member.email}
                            onChange={(e) => handleGroupMemberChange(index, "email", e.target.value)}
                            placeholder="Email address"
                            className="h-8"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`member-phone-${index}`} className="text-xs">
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`member-phone-${index}`}
                            value={member.phone}
                            onChange={(e) => handleGroupMemberChange(index, "phone", e.target.value)}
                            placeholder="Phone number"
                            className="h-8"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                    <p>
                      Your group members will receive an invitation to join your pilgrimage. They'll be able to complete
                      their personal details later.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure-city">
                Departure City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="departure-city"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                placeholder="Enter your departure city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure-date">
                Departure Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="departure-date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-date">
                Return Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate}
                required
              />
            </div>

            {/* --- Replace the Preferred Itinerary input with: --- */}
            <div className="space-y-2">
              <Label>
                Preferred Itinerary <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              {preferredItinerary.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={e => handleItineraryChange(idx, e.target.value)}
                    placeholder={`Itinerary item ${idx + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleRemoveItinerary(idx)}
                    aria-label="Remove itinerary item"
                  >
                    Remove
                  </Button>
                </div>
              ))} 
              <br />
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={handleAddItinerary}
              >
                Add Itinerary Item
              </Button>
              <p className="text-xs text-muted-foreground">
                Add each activity or plan as a separate item. Leave empty if you want the agency to handle it.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Select Services & Tiers</h3>
              <p className="text-gray-600">
                Choose the services you need for your journey and select the appropriate tier
              </p>

              <div className="space-y-6">
<div className="border p-4 rounded-lg">
  <div className="flex items-center space-x-2 mb-3">
    <Checkbox
      id="visa"
      checked={selectedServices.visa.selected}
      onCheckedChange={(checked) => handleServiceChange("visa", checked === true)}
    />
    <div>
      <Label htmlFor="visa" className="font-medium">
        Visa Assistance
      </Label>
      {(departureCity === "london" || departureCity === "newyork") && (
        <p className="text-xs text-green-600 mt-1">
          Note: Pilgrims from the UK and US are eligible for visa on arrival
        </p>
      )}
    </div>
  </div>

  {selectedServices.visa.selected && (
    <div className="ml-6 space-y-2">
      <Label className="text-sm">Select Visa Type</Label>
      <RadioGroup
        value={selectedServices.visa.tier}
        onValueChange={(value) => handleTierChange("visa", value)}
      >
        {/* Pilgrimage-specific visa options based on package type */}
        {packageType === "hajj" && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hajj-standard" id="visa-hajj-standard" />
            <Label htmlFor="visa-hajj-standard">Hajj Standard Visa</Label>
          </div>
        )}
        {packageType === "umrah" && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="umrah-standard" id="visa-umrah-standard" />
            <Label htmlFor="visa-umrah-standard">Umrah Standard Visa</Label>
          </div>
        )}
        
        {/* General visa options */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="short-term" id="visa-short-term" />
          <Label htmlFor="visa-short-term">Short-term (6 months)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="long-term"
            id="visa-long-term"
            disabled={
              departureCity === "lagos" || departureCity === "abuja" || departureCity === "kano"
            }
          />
          <Label
            htmlFor="visa-long-term"
            className={
              departureCity === "lagos" || departureCity === "abuja" || departureCity === "kano"
                ? "text-gray-400"
                : ""
            }
          >
            Long-term (1 year)
          </Label>
          {(departureCity === "lagos" || departureCity === "abuja" || departureCity === "kano") && (
            <span className="text-xs text-amber-600 ml-2">(Not available for Nigerian citizens)</span>
          )}
        </div>
      </RadioGroup>
    </div>
  )}
</div>


<div className="border p-4 rounded-lg">
  <div className="flex items-center space-x-2 mb-3">
    <Checkbox
      id="flight"
      checked={selectedServices.flight.selected}
      onCheckedChange={(checked) => handleServiceChange("flight", checked === true)}
    />
    <Label htmlFor="flight" className="font-medium">
      Flight Booking
    </Label>
  </div>

  {selectedServices.flight.selected && (
    <div className="ml-6 space-y-2">
      <Label className="text-sm">Select Tier</Label>
      <RadioGroup
        value={selectedServices.flight.tier}
        onValueChange={(value) => handleTierChange("flight", value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="economy" id="flight-economy" />
          <Label htmlFor="flight-economy">Economy Class</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="business" id="flight-business" />
          <Label htmlFor="flight-business">Business Class</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="first" id="flight-first" />
          <Label htmlFor="flight-first">First Class</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="private" id="flight-private" />
          <Label htmlFor="flight-private">Private Charter</Label>
        </div>
      </RadioGroup>
    </div>
  )}
</div>

                <div className="border p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="accommodation"
                      checked={selectedServices.accommodation.selected}
                      onCheckedChange={(checked) => handleServiceChange("accommodation", checked === true)}
                    />
                    <Label htmlFor="accommodation" className="font-medium">
                      Accommodation
                    </Label>
                  </div>

                  {selectedServices.accommodation.selected && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Accommodation Type</Label>
                        <RadioGroup
                          value={selectedServices.accommodation.type}
                          onValueChange={handleAccommodationTypeChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hotel" id="accommodation-hotel" />
                            <Label htmlFor="accommodation-hotel" className="flex items-center">
                              <Hotel className="h-4 w-4 mr-2" /> Hotel
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="apartment" id="accommodation-apartment" />
                            <Label htmlFor="accommodation-apartment" className="flex items-center">
                              <Building className="h-4 w-4 mr-2" /> Apartment Suites
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {selectedServices.accommodation.type === "hotel" ? (
                        <div className="space-y-2">
                          <Label className="text-sm">Hotel Class</Label>
                          <RadioGroup
                            value={selectedServices.accommodation.tier}
                            onValueChange={(value) => handleTierChange("accommodation", value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="accommodation-standard" />
                              <Label htmlFor="accommodation-standard">3-Star Hotel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="premium" id="accommodation-premium" />
                              <Label htmlFor="accommodation-premium">4-Star Hotel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="luxury" id="accommodation-luxury" />
                              <Label htmlFor="accommodation-luxury">5-Star Hotel</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-sm">Suite Type</Label>
                          <RadioGroup
                            value={selectedServices.accommodation.tier}
                            onValueChange={(value) => handleTierChange("accommodation", value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="suite-standard" />
                              <Label htmlFor="suite-standard">Standard (1 Bedroom)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="premium" id="suite-premium" />
                              <Label htmlFor="suite-premium">Premium (2 Bedroom)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="luxury" id="suite-luxury" />
                              <Label htmlFor="suite-luxury">Luxury (3+ Bedroom)</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm">Proximity to Haram</Label>
                        <RadioGroup
                          value={selectedServices.accommodation.proximity}
                          onValueChange={handleAccommodationProximityChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="proximity-standard" />
                            <Label htmlFor="proximity-standard">Standard (1-2 km)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="close" id="proximity-close" />
                            <Label htmlFor="proximity-close">Close (500m-1km)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="premium" id="proximity-premium" />
                            <Label htmlFor="proximity-premium">Premium (Less than 500m)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="transport"
                      checked={selectedServices.transport.selected}
                      onCheckedChange={(checked) => handleServiceChange("transport", checked === true)}
                    />
                    <Label htmlFor="transport" className="font-medium">
                      Local Transportation
                    </Label>
                  </div>

                  {selectedServices.transport.selected && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm">Select Tier</Label>
                      <RadioGroup
                        value={selectedServices.transport.tier}
                        onValueChange={(value) => handleTierChange("transport", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shared" id="transport-shared" />
                          <Label htmlFor="transport-shared">Shared Transport</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="transport-private" />
                          <Label htmlFor="transport-private">Private Transport</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="vip" id="transport-vip" />
                          <Label htmlFor="transport-vip">VIP Transport</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                <div className="border p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="food"
                      checked={selectedServices.food.selected}
                      onCheckedChange={(checked) => handleServiceChange("food", checked === true)}
                    />
                    <Label htmlFor="food" className="font-medium">
                      Meals
                    </Label>
                  </div>

                  {selectedServices.food.selected && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm">Select Tier</Label>
                      <RadioGroup
                        value={selectedServices.food.tier}
                        onValueChange={(value) => handleTierChange("food", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="food-standard" />
                          <Label htmlFor="food-standard">Standard Meals</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="premium" id="food-premium" />
                          <Label htmlFor="food-premium">Premium Meals</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="luxury" id="food-luxury" />
                          <Label htmlFor="food-luxury">Luxury Dining</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                <div className="border p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="visitation"
                      checked={selectedServices.visitation.selected}
                      onCheckedChange={(checked) => handleServiceChange("visitation", checked === true)}
                    />
                    <Label htmlFor="visitation" className="font-medium">
                      Visitation to Historical Sites
                    </Label>
                  </div>

                  {selectedServices.visitation.selected && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Select Tier</Label>
                        <RadioGroup
                          value={selectedServices.visitation.tier}
                          onValueChange={(value) => handleTierChange("visitation", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="visitation-standard" />
                            <Label htmlFor="visitation-standard">Standard Tour</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="extended" id="visitation-extended" />
                            <Label htmlFor="visitation-extended">Extended Tour</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="visitation-private" />
                            <Label htmlFor="visitation-private">Private Tour</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Select Sites to Visit</Label>
                        <div className="space-y-2 border p-3 rounded-md bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="site-badr"
                              checked={(selectedServices.visitation.sites as string[])?.includes("badr")}
                              onCheckedChange={(checked) => handleVisitationSiteChange("badr", checked === true)}
                            />
                            <Label htmlFor="site-badr">Badr</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="site-quba"
                              checked={(selectedServices.visitation.sites as string[])?.includes("quba")}
                              onCheckedChange={(checked) => handleVisitationSiteChange("quba", checked === true)}
                            />
                            <Label htmlFor="site-quba">Quba Mosque</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="site-hira"
                              checked={(selectedServices.visitation.sites as string[])?.includes("hira")}
                              onCheckedChange={(checked) => handleVisitationSiteChange("hira", checked === true)}
                            />
                            <Label htmlFor="site-hira">Hira Cave</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="site-uhud"
                              checked={(selectedServices.visitation.sites as string[])?.includes("uhud")}
                              onCheckedChange={(checked) => handleVisitationSiteChange("uhud", checked === true)}
                            />
                            <Label htmlFor="site-uhud">Mount Uhud</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="site-baqi"
                              checked={(selectedServices.visitation.sites as string[])?.includes("baqi")}
                              onCheckedChange={(checked) => handleVisitationSiteChange("baqi", checked === true)}
                            />
                            <Label htmlFor="site-baqi">
                              Jannat al-Baqi (Male only)
                              <span className="text-xs text-amber-600 ml-2">(Male pilgrims only)</span>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{isGroupBooking ? "Group Pilgrim Details" : "Personal Details"}</h2>
            <p className="text-gray-600">
              {isGroupBooking
                ? "Please provide information for all pilgrims in your group"
                : "Please provide your information for the pilgrimage"}
            </p>

            {isGroupBooking && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Total Pilgrims: {pilgrims.length}</span>
                </div>
                <Button variant="outline" size="sm" onClick={addPilgrim} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Pilgrim
                </Button>
              </div>
            )}

            {pilgrims.map((pilgrim, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                {isGroupBooking && (
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Pilgrim {index + 1}</h3>
                    {pilgrims.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePilgrim(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`firstName-${index}`}>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`firstName-${index}`}
                      value={pilgrim.firstName}
                      onChange={(e) => handlePilgrimChange(index, "firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lastName-${index}`}>
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`lastName-${index}`}
                      value={pilgrim.lastName}
                      onChange={(e) => handlePilgrimChange(index, "lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`}>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={pilgrim.email}
                    onChange={(e) => handlePilgrimChange(index, "email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`}>
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    value={pilgrim.phone}
                    onChange={(e) => handlePilgrimChange(index, "phone", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`country-${index}`}>
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={pilgrim.country}
                      onValueChange={(value) => handlePilgrimChange(index, "country", value)}
                      required
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
                    <Label htmlFor={`city-${index}`}>
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`city-${index}`}
                      value={pilgrim.city}
                      onChange={(e) => handlePilgrimChange(index, "city", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`passport-${index}`}>
                    Passport Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`passport-${index}`}
                    value={pilgrim.passport}
                    onChange={(e) => handlePilgrimChange(index, "passport", e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Your Package</h2>
            <p className="text-gray-600">Please review your selections before submitting</p>

            <PackageReview
              packageType={packageType}
              selectedPackage={selectedPackage}
              services={selectedServices}
              pilgrims={pilgrims}
              isGroupBooking={isGroupBooking}
              departureCity={departureCity}
              departureDate={departureDate}
            />

            {isCreatingGroup && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Group Information
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  You're creating a group with {groupMembers.length} invited member
                  {groupMembers.length !== 1 ? "s" : ""}. After submission, they will receive an invitation to join your
                  pilgrimage.
                </p>
                <div className="space-y-2">
                  {groupMembers.map((member, index) => (
                    <div key={index} className="flex items-center text-sm text-blue-700">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>
                        {member.name || "Unnamed member"} {member.email ? `(${member.email})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="container">
          <div className="mb-8">
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
                  <Button
                    className="bg-[#c8e823] text-black hover:bg-[#b5d31f]"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => printElement("package-review")}>
                      Print Review
                    </Button>
                    <Button
                      className="bg-[#c8e823] text-black hover:bg-[#b5d31f]"
                      onClick={handleSubmit}
                      disabled={false}
                    >
                      Submit <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
