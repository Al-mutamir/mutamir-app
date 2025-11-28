import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PilgrimDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  passport: string
}

interface ServiceDetails {
  selected: boolean
  tier: string
}

interface PackageReviewProps {
  packageType: string
  selectedPackage?: string
  services: {
    visa: ServiceDetails
    flight: ServiceDetails
    accommodation: ServiceDetails
    transport: ServiceDetails
    food: ServiceDetails
    visitation: ServiceDetails
  }
  pilgrims: PilgrimDetails[]
  isGroupBooking: boolean
  departureCity: string
  departureDate: string
  packageData?: {
    price: number
  }
}

export default function PackageReview({
  packageType,
  selectedPackage,
  services,
  pilgrims,
  isGroupBooking,
  departureCity,
  departureDate,
  packageData,
}: PackageReviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const getDepartureCity = (code: string) => {
    const cities: Record<string, string> = {
      lagos: "Lagos, Nigeria",
      abuja: "Abuja, Nigeria",
      newyork: "New York, USA",
      london: "London, UK",
    }
    return cities[code] || code
  }

  const getServiceTierLabel = (service: string, tier: string) => {
    const tiers: Record<string, Record<string, string>> = {
      visa: {
        standard: "Standard Processing",
        express: "Express Processing",
        vip: "VIP Processing",
      },
      flight: {
        economy: "Economy Class",
        business: "Business Class",
        first: "First Class",
      },
      accommodation: {
        standard: "3-Star Hotel",
        premium: "4-Star Hotel",
        luxury: "5-Star Hotel",
      },
      transport: {
        shared: "Shared Transport",
        private: "Private Transport",
        vip: "VIP Transport",
      },
      food: {
        standard: "Standard Meals",
        premium: "Premium Meals",
        luxury: "Luxury Dining",
      },
      visitation: {
        standard: "Standard Tour",
        extended: "Extended Tour",
        private: "Private Tour",
      },
    }

    return tiers[service]?.[tier] || tier
  }

  return (
    <Card className="border-2 border-[#c8e823]/20 print:border-black" id="package-review">
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h3 className="text-2xl font-bold">Almutamir</h3>
            <p className="text-gray-600">Your Sacred Journey, Your Way</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Reference: MUT-{Math.floor(Math.random() * 10000)}</p>
            <p className="text-gray-600">Date: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Package Information</h4>
            <div className="space-y-1 text-gray-600">
              <p>
                <span className="font-medium text-black">Package Type:</span>{" "}
                {packageType === "hajj" ? "Hajj" : "Umrah"}
              </p>
              {selectedPackage && (
                <p>
                  <span className="font-medium text-black">Selected Package:</span> {selectedPackage}
                </p>
              )}
              <p>
                <span className="font-medium text-black">Booking Type:</span>{" "}
                {isGroupBooking ? "Group Booking" : "Individual Booking"}
              </p>
              <p>
                <span className="font-medium text-black">Number of Pilgrims:</span> {pilgrims.length}
              </p>
              <p>
                <span className="font-medium text-black">Departure City:</span> {getDepartureCity(departureCity)}
              </p>
              <p>
                <span className="font-medium text-black">Departure Date:</span> {formatDate(departureDate)}
              </p>
              {packageData?.price && (
                <p>
                  <span className="font-medium text-black">Price:</span> ₦{packageData.price.toLocaleString()}
                </p>
              )}
            </div>

            <h4 className="font-semibold text-lg mt-6 mb-2">Selected Services</h4>
            <ul className="space-y-1">
              {services.visa.selected && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8e823]" />
                  Visa Assistance - {getServiceTierLabel("visa", services.visa.tier)}
                </li>
              )}
              {services.flight.selected && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8e823]" />
                  Flight Booking - {getServiceTierLabel("flight", services.flight.tier)}
                </li>
              )}
              {services.accommodation.selected && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8e823]" />
                  Accommodation - {getServiceTierLabel("accommodation", services.accommodation.tier)}
                </li>
              )}
              {services.transport.selected && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8e823]" />
                  Local Transportation - {getServiceTierLabel("transport", services.transport.tier)}
                </li>
              )}
              {services.food.selected && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8e823]" />
                  Meals - {getServiceTierLabel("food", services.food.tier)}
                </li>
              )}
              {services.visitation.selected && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8e823]" />
                  Visitation to Historical Sites - {getServiceTierLabel("visitation", services.visitation.tier)}
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-2">Pilgrim Information</h4>
            {pilgrims.map((pilgrim, index) => (
              <div key={index} className={`${index > 0 ? "mt-4 pt-4 border-t" : ""}`}>
                {isGroupBooking && <p className="font-medium">Pilgrim {index + 1}</p>}
                <div className="space-y-1 text-gray-600">
                  <p>
                    <span className="font-medium text-black">Name:</span> {pilgrim.firstName} {pilgrim.lastName}
                  </p>
                  <p>
                    <span className="font-medium text-black">Email:</span> {pilgrim.email}
                  </p>
                  <p>
                    <span className="font-medium text-black">Phone:</span> {pilgrim.phone}
                  </p>
                  <p>
                    <span className="font-medium text-black">Country:</span> {pilgrim.country}
                  </p>
                  <p>
                    <span className="font-medium text-black">City:</span> {pilgrim.city}
                  </p>
                  <p>
                    <span className="font-medium text-black">Passport:</span> {pilgrim.passport}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-center text-gray-600 text-sm">
            This is a summary of your selected package. Final pricing will be determined based on current rates and
            availability. A Mutamir representative will contact you shortly to finalize your booking.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
