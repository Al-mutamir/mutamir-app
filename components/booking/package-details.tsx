import { formatCurrency, parseDate } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

export function PackageDetails({ packageDetails }: { packageDetails: any }) {
  if (!packageDetails) return <p>No package information available</p>

  const formatDate = (date: any) => {
    const d = parseDate(date)
    return d ? d.toLocaleDateString() : "Not specified"
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{packageDetails.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{packageDetails.description}</p>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Package Information</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm text-gray-500">Type:</div>
          <div>{packageDetails.type || "Standard Package"}</div>

          <div className="text-sm text-gray-500">Price:</div>
          <div className="font-medium">{formatCurrency(packageDetails.price)}</div>

          <div className="text-sm text-gray-500">Duration:</div>
          <div>{packageDetails.duration} days</div>

          <div className="text-sm text-gray-500">Location:</div>
          <div>{packageDetails.location || packageDetails.destination}</div>

          <div className="text-sm text-gray-500">Departure Date:</div>
          <div>
            {packageDetails.flexibleDates
              ? "Flexible"
              : formatDate(packageDetails.departureDate || packageDetails.startDate)}
          </div>

          <div className="text-sm text-gray-500">Return Date:</div>
          <div>
            {packageDetails.flexibleDates
              ? "Flexible"
              : formatDate(packageDetails.arrivalDate || packageDetails.endDate)}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Included Services</h3>
        <div className="grid grid-cols-2 gap-2">
          {packageDetails.services?.visa && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Visa Processing</span>
            </div>
          )}
          {packageDetails.services?.flight && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Flight Tickets</span>
            </div>
          )}
          {packageDetails.services?.transport && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Local Transportation</span>
            </div>
          )}
          {packageDetails.services?.food && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Meals & Refreshments</span>
            </div>
          )}
          {packageDetails.services?.guide && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Guided Tours</span>
            </div>
          )}
          {packageDetails.services?.accommodation && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Accommodation</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Agency Information</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm text-gray-500">Agency Name:</div>
          <div>{packageDetails.agencyName || "Al-Mutamir"}</div>

          {packageDetails.agencyContact && (
            <>
              <div className="text-sm text-gray-500">Contact:</div>
              <div>{packageDetails.agencyContact}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
