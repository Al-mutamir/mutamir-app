import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

// Function to create a new notification
export async function createNotification(
  userId: string,
  type: string,
  message: string,
  relatedItemId?: string,
): Promise<void> {
  try {
    const notificationsCollection = collection(db, `users/${userId}/notifications`)
    await addDoc(notificationsCollection, {
      type: type,
      message: message,
      relatedItemId: relatedItemId || null,
      timestamp: serverTimestamp(),
      read: false,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Function to create a payment notification
export async function createPaymentNotification(
  agencyId: string,
  pilgrimId: string,
  packageId: string,
  amount: number,
): Promise<void> {
  try {
    await createNotification(
      agencyId,
      "payment",
      `New payment of ₦${amount.toLocaleString()} received from ${pilgrimId.substring(0, 8)} for package ${packageId.substring(0, 8)}`,
      packageId,
    )
  } catch (error) {
    console.error("Error creating payment notification:", error)
    throw error
  }
}

// Function to create a booking notification
export async function createBookingNotification(agencyId: string, pilgrimId: string, packageId: string): Promise<void> {
  try {
    await createNotification(
      agencyId,
      "booking",
      `New booking request received from ${pilgrimId.substring(0, 8)} for package ${packageId.substring(0, 8)}`,
      packageId,
    )
  } catch (error) {
    console.error("Error creating booking notification:", error)
    throw error
  }
}

// Function to create a custom request notification
export async function createCustomRequestNotification(
  agencyId: string,
  pilgrimId: string,
  message: string,
): Promise<void> {
  try {
    await createNotification(
      agencyId,
      "custom_request",
      `New custom request received from ${pilgrimId.substring(0, 8)}: ${message}`,
    )
  } catch (error) {
    console.error("Error creating custom request notification:", error)
    throw error
  }
}
