// lib/firebase/interface/package.ts

/**
 * Package Status
 */
export type PackageStatus =
  | "draft"
  | "active"
  | "full"
  | "completed"
  | "archived"

/**
 * Package Type
 */
export type PackageType =
  | "umrah"
  | "hajj"
  | "ramadan-umrah"
  | "custom"

/**
 * Accommodation Details
 */
export interface Accommodation {
  hotelName: string
  city: string

  hotelClass?: 3 | 4 | 5

  roomType?: "Single" | "Double" | "Triple" | "Quad"

  description?: string

  distanceFromHaram?: {
    value: number
    unit: "m" | "km"
  }

  images?: string[]
}

/**
 * Package Itinerary
 */
export interface ItineraryDay {
  day: number

  city?: string

  title: string

  description: string
}

/**
 * Travel Date Option
 */
export interface AvailableDate {
  departureDate: string
  returnDate: string
}

/**
 * Package
 */
export interface Package {
  /**
   * Firestore Document ID
   */
  id?: string

  /**
   * Basic Information
   */
  title: string

  description: string

  type?: PackageType

  /**
   * Agency
   */
  agencyId: string

  agencyName?: string

  /**
   * Pricing
   */
  price: number

  minPaymentPercent?: number

  /**
   * Travel Information
   */
  destination?: string

  departureCity?: string

  duration: number

  departureDate?: string

  returnDate?: string

  flexibleDates?: boolean

  availableDates?: AvailableDate[]

  /**
   * Capacity
   */
  groupSize?: number

  availableSlots?: number

  /**
   * Media
   */
  imageUrl?: string

  gallery?: string[]

  /**
   * Package Details
   */
  inclusions: string[]

  exclusions: string[]

  accommodations?: Accommodation[]

  itinerary?: ItineraryDay[]

  /**
   * Package State
   */
  status?: PackageStatus

  /**
   * Statistics
   */
  rating?: number

  bookingsCount?: number

  /**
   * Metadata
   */
  createdAt?: any

  updatedAt?: any
}