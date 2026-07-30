// TypeScript interface for a travel package in Firebase Firestore

export interface Package {
  id?: string
  title: string
  description: string
  price: number
  duration: number
  inclusions: string[]
  exclusions: string[]
  agencyId: string
  agencyName?: string
  status?: "active" | "draft" | "archived"
  groupSize?: number
  type?: string
  startDate?: string
  endDate?: string
  imageUrl?: string
  destination?: string
  departureCity?: string
  departureDate?: string
  returnDate?: string
  accommodationType?: string
  transportation?: string
  meals?: string
  availableDates?: {
    startDate: string
    endDate: string
  }[]
  itinerary?: {
    title: string
    description: string
  }[]
  rating?: number
  createdAt?: any
  updatedAt?: any
}