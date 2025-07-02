import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

export interface Notification {
  id?: string
  userId: string
  type: "payment" | "booking" | "request" | "system"
  title: string
  message: string
  read: boolean
  createdAt: any
  relatedId?: string
  amount?: number
}

// Create a new notification
export async function createNotification(notification: Omit<Notification, "id" | "read" | "createdAt">) {
  try {
    const notificationsRef = collection(db, "notifications")
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string) {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[]
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
    })

    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Create payment notification
export async function createPaymentNotification(
  agencyId: string,
  pilgrimId: string,
  packageId: string,
  amount: number,
) {
  try {
    await createNotification({
      userId: agencyId,
      type: "payment",
      title: "New Payment Received",
      message: `A pilgrim has made a payment of ₦${amount.toLocaleString()} for one of your packages.`,
      relatedId: packageId,
      amount: amount,
    })

    return true
  } catch (error) {
    console.error("Error creating payment notification:", error)
    return false
  }
}

// Create booking notification
export async function createBookingNotification(agencyId: string, pilgrimId: string, packageId: string) {
  try {
    await createNotification({
      userId: agencyId,
      type: "booking",
      title: "New Booking Request",
      message: "A pilgrim has requested to book one of your packages.",
      relatedId: packageId,
    })

    return true
  } catch (error) {
    console.error("Error creating booking notification:", error)
    return false
  }
}

// Create custom request notification
export async function createCustomRequestNotification(agencyId: string, pilgrimId: string, requestDetails: string) {
  try {
    await createNotification({
      userId: agencyId,
      type: "request",
      title: "New Custom Request",
      message: `A pilgrim has submitted a custom request: ${requestDetails.substring(0, 100)}${requestDetails.length > 100 ? "..." : ""}`,
      relatedId: pilgrimId,
    })

    return true
  } catch (error) {
    console.error("Error creating custom request notification:", error)
    return false
  }
}
