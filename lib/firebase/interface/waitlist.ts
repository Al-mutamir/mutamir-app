export type InterestedIn = "Hajj" | "Umrah" | "Both"

export type PlanningStage =
  | "Just researching"
  | "Want to start saving"
  | "Need financing"
  | "Ready to book"
  | string

export type PreferredFrequency = "Daily" | "Weekly" | "Monthly" | string

export interface WaitlistEntry {
  id?: string
  userId?: string | null
  name: string
  phone: string
  email?: string
  state: string
  city?: string
  interestedIn: InterestedIn
  plannedYear: string
  planningStage: PlanningStage
  numPilgrims: number
  firstTime?: boolean
  preferredFrequency?: PreferredFrequency
  estimatedMonthly?: number | null
  heardAbout?: string
  whatsappConsent: boolean
  acceptTerms: boolean
  notifyUpdates?: boolean
  feature?: string
  // Firestore timestamps (serverTimestamp values will resolve to Timestamp on read)
  createdAt?: any
  updatedAt?: any
}
