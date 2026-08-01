// TypeScript interface for a payment in the Firebase Firestore database

export interface Payment {
  id?: string

  bookingId: string

  // Canonical payer field for payments: pilgrimId
  // Keep userId as an optional alias for backward compatibility
  pilgrimId?: string
  userId?: string

  agencyId?: string

  packageId?: string

  amount: number

  status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"

  reference: string

  method: string

  date?: any

  createdAt?: any
}