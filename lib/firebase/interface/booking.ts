// TypeScript interface for a booking in the Firebase Firestore database

export interface PilgrimDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  passport: string
}

export interface GroupMember {
  name: string
  email: string
  phone: string
}

export interface ServiceSelection {
  selected: boolean
  tier?: string
  type?: string
  proximity?: string
  sites?: string[]
  details?: Record<string, unknown>
}

export interface SelectedServices {
  visa: ServiceSelection
  flight: ServiceSelection
  accommodation: ServiceSelection
  transport: ServiceSelection
  food: ServiceSelection
  visitation: ServiceSelection
}

export interface Booking {
  id: string
  packageId: string
  packageTitle: string
  pilgrimId: string
  agencyId: string
  userEmail: string
  departureCity: string

  travelDate: Date | string
  returnDate: Date | string

  totalPrice: number

  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"

  paymentStatus:
    | "unpaid"
    | "partial"
    | "paid"

  paymentReference?: string

  countryOfResidence?: string
  cityOfResidence?: string
  passportNumber?: string

  highlights?: string[]
  notes?: string
  rating?: number

  // Group / pilgrim details captured from the booking form
  pilgrims?: PilgrimDetails[]
  isGroupBooking?: boolean
  isCreatingGroup?: boolean
  groupMembers?: GroupMember[]
  selectedServices?: SelectedServices

  createdAt?: any
  updatedAt?: any
}