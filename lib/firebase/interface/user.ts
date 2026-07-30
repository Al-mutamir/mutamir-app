// TypeScript interface for a user in the Firebase Firestore database

import type { UserRole } from "@/context/auth-context"


export interface User {
  id?: string;
  uid: string;

  email: string;
  displayName?: string;
  photoURL?: string;

  role?: UserRole; // Updated to use UserRole type from auth-context.tsx

  // role: "admin" | "agency" | "pilgrim";


  firstName?: string;
  lastName?: string;
  fullName?: string;

  // Agency fields
  agencyName?: string;
  handlerFirstName?: string;
  handlerLastName?: string;
  handlerFullName?: string;
  managerName?: string;

  phoneNumber?: string;
  alternativeEmail?: string;

  countryOfOperation?: string;
  cityOfOperation?: string;

  // Pilgrim fields
  passportNumber?: string;
  countryOfResidence?: string;
  cityOfResidence?: string;
  gender?: string;
  age?: number;

  nextOfKin?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;

  // Common fields
  status?: "unverified" | "verified" | "suspended";
  onboardingCompleted?: boolean;

  createdAt?: any;
  updatedAt?: any;
}