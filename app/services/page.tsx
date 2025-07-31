"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowRight, Plus, Trash2, Users, UserPlus, Info, Building, Hotel, ThumbsUp } from "lucide-react"
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
import { createBooking, savePilgrimDetails } from "@/firebase/firestore" // Make sure savePilgrimDetails exists
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, isBefore, isSameDay, startOfDay, addDays } from "date-fns"
import { cn } from "@/lib/utils"

// Import the utility functions
import { printElement } from "@/utils/print-utils"
import { CheckCircle2 } from "lucide-react"

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

interface SuccessModalProps {
  open: boolean
  onClose: (path?: string) => void
  bookingDetails: {
    packageType: string
    departureDate: string
    pilgrims?: any[]
  }
}

// Replace SuccessModal with this minimal version:
function SuccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-6 relative flex flex-col items-center">
        <button
          className="absolute top-3 right-3 bg-[#E3B23C] text-[#014034] hover:bg-[#007F5F] hover:text-white text-xs font-semibold px-3 py-1 rounded transition"
          onClick={() => window.open('/pilgrim-guide', '_blank')}
          aria-label="Pilgrim Guide"
        >
          Pilgrim Guide
        </button>
        <ThumbsUp className="h-12 w-12 text-[#007F5F] mb-4" />
        <h2 className="text-lg font-semibold text-[#014034] text-center mb-2">
          Booking request successful
        </h2>
        <p className="text-gray-600 text-center text-sm">
          A representative will contact you shortly.<br />Thanks for choosing Almutamir.
        </p>
      </div>
    </div>
  )
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

  // --- Add this state for controlling the success modal ---
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setIsSubmitting(true)
    // Store booking details in localStorage for the success page
    const bookingDetails = {
      packageType,
      selectedPackage,
      isGroupBooking,
      pilgrims,
      departureCity,
      departureDate,
      returnDate,
      preferredItinerary,
      services: selectedServices,
      isCreatingGroup,
      groupMembers,
    }

    try {
      // Save booking to Firestore (using the first pilgrim as the main contact)
      const mainPilgrim = pilgrims[0]
      await createBooking({
        packageId: selectedPackage || "custom",
        packageTitle: packageType,
        pilgrimId: mainPilgrim.email,
        userEmail: mainPilgrim.email,
        agencyId: "custom",
        status: "pending",
        travelDate: departureDate,
        returnDate: returnDate,
        totalPrice: 0,
        paymentStatus: "unpaid",
        highlights: preferredItinerary,
        notes: "",
        departureCity,
        pilgrims,
        isGroupBooking,
        isCreatingGroup,
        groupMembers,
        // Save full details of selected services for best matching
        selectedServices: {
          visa: { ...selectedServices.visa },
          flight: { ...selectedServices.flight },
          accommodation: { ...selectedServices.accommodation },
          transport: { ...selectedServices.transport },
          food: { ...selectedServices.food },
          visitation: { ...selectedServices.visitation },
        },
      })

      // Save each pilgrim's details to Firestore (optional, if you want individual records)
      for (const pilgrim of pilgrims) {
        await savePilgrimDetails(pilgrim)
      }

      // Send confirmation email
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mainPilgrim.email,
          subject: "Your Al-mutamir Booking Confirmation",
          text: `Dear ${mainPilgrim.firstName},\n\nYour booking has been received. We will contact you soon.\n\nThank you for choosing Al-mutamir!`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Al-mutamir Booking Confirmation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: white;
            padding: 40px 40px 20px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 30px;
        }
        
        .logo-icon {
            width: 32px;
            height: 32px;
            background: #c8e823;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #1a1a1a;
        }
        
        .logo-text {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .illustration {
            width: 120px;
            height: 120px;
            background: #f8f9fa;
            border-radius: 60px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        
        .subheading {
            font-size: 18px;
            color: #c8e823;
            font-weight: 500;
            margin-bottom: 20px;
        }
        
        .content {
            padding: 30px 40px;
            line-height: 1.6;
        }
        
        .message {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 20px;
        }
        
        .highlight-box {
            background: #f0f9d4;
            border: 1px solid #c8e823;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .highlight-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        
        .highlight-text {
            font-size: 14px;
            color: #4a4a4a;
        }
        
        .action-button {
            display: inline-block;
            background: #c8e823;
            color: #1a1a1a;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        
        .action-button:hover {
            background: #b5d31f;
            transform: translateY(-1px);
        }
        
        .details-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .details-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        
        .details-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .details-label {
            color: #6b7280;
        }
        
        .details-value {
            color: #1a1a1a;
            font-weight: 500;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .contact-info {
            font-size: 14px;
            color: #4F46E5;
            text-decoration: none;
        }
        
        .signature {
            margin-top: 20px;
            font-size: 14px;
            color: #6b7280;
        }
        
        .social-links {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .social-link {
            width: 32px;
            height: 32px;
            background: #4F46E5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: white;
            font-size: 14px;
        }
        
        .copyright {
            margin-top: 20px;
            font-size: 12px;
            color: #9ca3af;
        }
        
        /* Responsive design */
        @media (max-width: 640px) {
            body {
                padding: 20px 10px;
            }
            
            .header,
            .content,
            .footer {
                padding: 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .subheading {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="greeting">Hi ${mainPilgrim.firstName},</div>
            <div class="subheading">Your Spiritual Journey Begins!</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="message">
                We are delighted to confirm your booking for your spiritual journey. Your pilgrimage details have been received and are being processed by our team.
            </div>
            
            <div class="highlight-box">
                <div class="highlight-title">What happens next?</div>
                <div class="highlight-text">
                    Our team will review your booking and contact you within 24-48 hours to confirm all details and arrange payment. 
                    SWe'll also send you a comprehensive guide to help you prepare for your journey.
                </div>
            </div>
            
            <div class="details-section">
                <div class="details-title">Your Booking Summary</div>
                <div class="details-item">
                    <span class="details-label">Package Type:</span>
                    <span class="details-value">${packageType}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Departure Date:</span>
                    <span class="details-value">${departureDate}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Return Date:</span>
                    <span class="details-value">${returnDate}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Departure City:</span>
                    <span class="details-value">${departureCity}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Number of Pilgrims:</span>
                    <span class="details-value">${pilgrims.length}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Preferred Itinerary:</span>
                    <span class="details-value">${preferredItinerary.length > 0 ? preferredItinerary.join(", ") : "Not specified"}</span> 
                </div>
                <div class="details-item">
                    <span class="details-label">Services Selected:</span>
                    <span class="details-value">
                        ${Object.entries(selectedServices)
                          .filter(([_, service]) => service.selected)
                          .map(([key, service]) => `${key.charAt(0).toUpperCase() + key.slice(1)} (${service.tier})`)
                          .join(", ") || "None"}
                    </span> 
                  </div>
            </div>
            
            <div class="message">
                At Al-mutamir, we understand the spiritual significance of your journey. Our experienced team is dedicated to ensuring your pilgrimage is meaningful, comfortable, and memorable.
            </div>
            
            <div class="message">
                If you have any questions or need to make changes to your booking, please don't hesitate to contact us. We're here to help make your pilgrimage experience exceptional.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                If you need assistance, please contact us at:
            </div>
            <a href="mailto:support@al-mutamir.com" class="contact-info">support@almutamir.com</a>
            
            <div class="signature">
                <div style="margin-top: 20px; font-weight: 500; color: #1a1a1a;">
                    Warm regards,<br>
                    The Al-mutamir Team
                </div>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} Al-mutamir. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html></p>`,
        }),
      })

      // --- Notify Discord ---
      await notifyDiscord(bookingDetails)

    } catch (e) {
      console.error("Failed to store booking details or send email:", e)
    }
    setTimeout(() => {
      setShowSuccess(true)
      setIsSubmitting(false)
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

  // Block out today and next 2 days for departure
  const today = startOfDay(new Date())
  const minDepartureDate = addDays(today, 3)
  const [departureDateObj, setDepartureDateObj] = useState<Date | undefined>(
    departureDate ? new Date(departureDate) : undefined
  )
  const [returnDateObj, setReturnDateObj] = useState<Date | undefined>(
    returnDate ? new Date(returnDate) : undefined
  )

  // Sync string and date states
  useEffect(() => {
    if (departureDateObj) setDepartureDate(departureDateObj.toISOString().split("T")[0])
    else setDepartureDate("")
  }, [departureDateObj])
  useEffect(() => {
    if (returnDateObj) setReturnDate(returnDateObj.toISOString().split("T")[0])
    else setReturnDate("")
  }, [returnDateObj])

  // Only allow departure from the 3rd day onward
  const disablePastDates = (day: Date) => isBefore(day, minDepartureDate)
  // Only allow return after departure date (and after minDepartureDate)
  const disableReturnDates = (day: Date) =>
    isBefore(day, minDepartureDate) ||
    (departureDateObj ? isSameDay(day, departureDateObj) || isBefore(day, departureDateObj) : false)

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

            {/* --- Use calendar popover for departure date --- */}
            <div className="space-y-2">
              <Label htmlFor="departure-date">
                Departure Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !departureDateObj && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDateObj ? format(departureDateObj, "PPP") : "Select your departure date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDateObj}
                    onSelect={setDepartureDateObj}
                    initialFocus
                    disabled={disablePastDates}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* --- Use calendar popover for return date --- */}
            <div className="space-y-2">
              <Label htmlFor="return-date">
                Return Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !returnDateObj && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDateObj ? format(returnDateObj, "PPP") : "Select your return date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDateObj}
                    onSelect={setReturnDateObj}
                    initialFocus
                    disabled={disableReturnDates}
                  />
                </PopoverContent>
              </Popover>
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

  // Set default visa tier based on package type
  const defaultVisaTier = packageType === "hajj" ? "hajj-standard" : "umrah-standard"
  // When packageType changes, update visa tier if not already set
  useEffect(() => {
    setSelectedServices((prev) => ({
      ...prev,
      visa: {
        ...prev.visa,
        tier: defaultVisaTier,
      },
    }))
  }, [packageType])

  return (
    <div className="min-h-screen bg-sacredStone">
      <div className="py-12">
        <div className="container">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-[#014034]">Plan Your Journey</h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-[#E3B23C]" : "bg-gray-300"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-[#E3B23C]" : "bg-gray-300"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 3 ? "bg-[#E3B23C]" : "bg-gray-300"}`}></div>
              </div>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto bg-white border border-[#E3B23C]">
            <CardContent className="p-6 md:p-10">
              {renderStepContent()}

              <div className="flex flex-col md:flex-row justify-between mt-8 gap-3">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="w-full md:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <Button
                    className="w-full md:w-auto bg-[#E3B23C] text-black hover:bg-[#b5d31f]"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="w-full md:w-auto bg-[#E3B23C] text-black hover:bg-[#b5d31f]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#014034" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="#014034" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Add the SuccessModal component here --- */}
      {showSuccess && (
        <SuccessModal
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}
