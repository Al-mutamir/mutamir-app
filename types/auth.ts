export type UserRole = "pilgrim" | "agency" | null

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role?: UserRole
}
