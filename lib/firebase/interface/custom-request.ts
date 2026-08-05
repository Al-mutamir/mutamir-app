// TypeScript interface for a custom pilgrimage request in the Firebase Firestore database
//
// A "custom request" is created from the multi-step services page, where a
// pilgrim (logged in or not) configures a Hajj/Umrah package from scratch
// instead of booking a pre-built package from an agency.

export interface PilgrimEntry {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  passport: string
}

export interface GroupMemberInvite {
  name: string
  email: string
  phone: string
}

export interface RequestedService {
  selected: boolean
  tier?: string
  type?: string
  proximity?: string
  sites?: string[]
  details?: Record<string, any>
}

export interface CustomRequestServices {
  visa: RequestedService
  flight: RequestedService
  accommodation: RequestedService
  transport: RequestedService
  food: RequestedService
  visitation: RequestedService
}

export interface CustomRequest {
  id?: string

  // Ownership. Exactly one of userId / visitorId is set, indicated by isGuest.
  userId?: string // Firebase Auth UID, when the requester is signed in
  visitorId?: string // Persisted anonymous id, when the requester is a guest
  isGuest: boolean

  packageType: "hajj" | "umrah"
  departureCity: string
  travelDate: string
  returnDate: string

  isGroupBooking: boolean
  isCreatingGroup: boolean
  pilgrims: PilgrimEntry[]
  groupMembers: GroupMemberInvite[]

  services: CustomRequestServices
  preferredItinerary: string[]

  status: "pending" | "reviewed" | "converted" | "cancelled"

  contactEmail: string
  confirmationSent?: boolean

  createdAt?: any
  updatedAt?: any
}