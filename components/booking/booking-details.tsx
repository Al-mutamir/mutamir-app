import { Badge } from "@/components/ui/badge"
import { formatCurrency, parseDate } from "@/lib/utils"

export function BookingDetails({ booking }: { booking: any }) {
  if (!booking) return <p>No booking information available</p>

  const formatDate = (date: any) => {
    const d = parseDate(date)
    return d ? d.toLocaleDateString() : "Not specified"
  }

  const getStatusColor = (status: any) => {
    switch (status) {
      case "confirmed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">Booking Reference</h3>
          <p className="font-mono">{booking.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <Badge className={getStatusColor(booking.status)}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Package Details</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm text-gray-500">Package Name:</div>
          <div>{booking.packageTitle}</div>

          <div className="text-sm text-gray-500">Package Type:</div>
          <div>{booking.packageType}</div>

          <div className="text-sm text-gray-500">Agency:</div>
          <div>{booking.agencyName}</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Travel Information</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm text-gray-500">Departure Date:</div>
          <div>
            {booking.flexibleDates
              ? "Flexible"
              : formatDate(booking.departureDate)}
          </div>

          <div className="text-sm text-gray-500">Return Date:</div>
          <div>
            {booking.flexibleDates
              ? "Flexible"
              : formatDate(booking.arrivalDate || booking.returnDate)}
          </div>

          <div className="text-sm text-gray-500">Duration:</div>
          <div>{booking.duration} days</div>

          <div className="text-sm text-gray-500">Location:</div>
          <div>{booking.location}</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Payment Information</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm text-gray-500">Total Price:</div>
          <div className="font-medium">{formatCurrency(booking.totalPrice)}</div>

          <div className="text-sm text-gray-500">Payment Status:</div>
          <div>
            <Badge className={getStatusColor(booking.paymentStatus)}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Badge>
          </div>

          {booking.paymentReference && (
            <>
              <div className="text-sm text-gray-500">Payment Reference:</div>
              <div className="font-mono text-sm">{booking.paymentReference}</div>
            </>
          )}

          {booking.paymentDate && (
            <>
              <div className="text-sm text-gray-500">Payment Date:</div>
              <div>{formatDate(booking.paymentDate)}</div>
            </>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Pilgrim Information</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm text-gray-500">Name:</div>
          <div>{booking.userName}</div>

          <div className="text-sm text-gray-500">Email:</div>
          <div>{booking.userEmail}</div>

          {booking.passportNumber && (
            <>
              <div className="text-sm text-gray-500">Passport Number:</div>
              <div>{booking.passportNumber}</div>
            </>
          )}

          {booking.userPhone && (
            <>
              <div className="text-sm text-gray-500">Phone:</div>
              <div>{booking.userPhone}</div>
            </>
          )}

          {/* {booking.userId && (
            <>
              <div className="text-sm text-gray-500">User ID:</div>
              <div>{booking.userId}</div>
            </>
          )} */}
        </div>
      </div>
    </div>
  )
}
