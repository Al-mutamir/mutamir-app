// Interface for Agency data structure in Firebase Firestore

import { User} from "./user"

export interface Agency extends User {
  id?: string;
  
  agencyName: string

  managerName: string

  countryOfOperation: string

  cityOfOperation: string

  alternativeEmail?: string

  averagePilgrimsPerYear?: number

  servicesOffered?: {
    ticketing: boolean
    visaProcessing: boolean
    accommodation: boolean
    feeding: boolean
    localTransportation: boolean
    touristGuide: boolean
  }
}