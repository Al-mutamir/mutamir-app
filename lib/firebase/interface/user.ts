// This file defines the User interface and related types for the application. It includes user roles, statuses, personal information, contact details, passport information, next of kin details, pilgrim preferences, agency information, and timestamps.

type UserRole = "pilgrim" | "agency" | "admin"

type UserStatus = "unverified" | "verified" | "suspended"

interface ServicesOffered {
  ticketing: boolean
  visaProcessing: boolean
  accommodation: boolean
  feeding: boolean
  localTransportation: boolean
  touristGuide: boolean
  other?: boolean
}

interface NextOfKin {
  fullName: string
  relationship: string
  phoneNumber: string
  email?: string
  address?: string
}

export interface User {
  // Firebase / Account Identity
  id?: string
  uid: string
  email: string
  displayName?: string
  photoURL?: string

  // Account
  role: UserRole
  status?: UserStatus
  onboardingCompleted: boolean

  // Personal Information
  firstName?: string
  lastName?: string
  fullName?: string
  gender?: string
  age?: number
  dateOfBirth?: string

  // Contact & Residence
  phoneNumber?: string
  alternativeEmail?: string
  address?: string
  cityOfResidence?: string
  state?: string
  countryOfResidence?: string

  // Passport / Travel Information
  passportNumber?: string
  passportExpiry?: string

  // Next of Kin
  nextOfKin?: NextOfKin

  // Pilgrim Preferences
  preferences?: unknown

  // Agency Information
  agencyName?: string
  managerName?: string
  handlerFirstName?: string
  handlerLastName?: string
  handlerFullName?: string
  countryOfOperation?: string
  cityOfOperation?: string
  averagePilgrimsPerYear?: number
  servicesOffered?: ServicesOffered

  // Timestamps
  createdAt?: unknown
  updatedAt?: unknown
}

