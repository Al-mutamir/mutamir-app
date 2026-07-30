import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config";

import type {
  Notification,
  CreateNotification,
} from "../interface/notification";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }

  return db;
}

/**
 * Create a notification
 */
export async function createNotification(
  notification: CreateNotification
): Promise<string> {
  try {
    const firestore = checkDb();

    const notificationsRef = collection(firestore, "notifications");

    const docRef = await addDoc(notificationsRef, {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const firestore = checkDb();

    const notificationsRef = collection(firestore, "notifications");

    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Notification, "id">),
    }));
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const firestore = checkDb();

    const notificationRef = doc(
      firestore,
      "notifications",
      notificationId
    );

    await updateDoc(notificationRef, {
      read: true,
    });

    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  try {
    const firestore = checkDb();

    const notificationsRef = collection(firestore, "notifications");

    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);

    await Promise.all(
      snapshot.docs.map((notification) =>
        updateDoc(notification.ref, {
          read: true,
        })
      )
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Create payment notification
 */
export async function createPaymentNotification(
  agencyId: string,
  pilgrimId: string,
  packageId: string,
  amount: number
): Promise<boolean> {
  try {
    await createNotification({
      userId: agencyId,
      type: "payment",
      title: "New Payment Received",
      message: `A pilgrim has made a payment of ₦${amount.toLocaleString()} for one of your packages.`,
      relatedId: packageId,
      amount,
    });

    return true;
  } catch (error) {
    console.error("Error creating payment notification:", error);
    return false;
  }
}

/**
 * Create booking notification
 */
export async function createBookingNotification(
  agencyId: string,
  pilgrimId: string,
  packageId: string
): Promise<boolean> {
  try {
    await createNotification({
      userId: agencyId,
      type: "booking",
      title: "New Booking Request",
      message: "A pilgrim has requested to book one of your packages.",
      relatedId: packageId,
    });

    return true;
  } catch (error) {
    console.error("Error creating booking notification:", error);
    return false;
  }
}

/**
 * Create custom request notification
 */
export async function createCustomRequestNotification(
  agencyId: string,
  pilgrimId: string,
  requestDetails: string
): Promise<boolean> {
  try {
    await createNotification({
      userId: agencyId,
      type: "request",
      title: "New Custom Request",
      message: `A pilgrim has submitted a custom request: ${requestDetails.substring(
        0,
        100
      )}${requestDetails.length > 100 ? "..." : ""}`,
      relatedId: pilgrimId,
    });

    return true;
  } catch (error) {
    console.error("Error creating custom request notification:", error);
    return false;
  }
}

/**
 * Create system notification
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string
): Promise<boolean> {
  try {
    await createNotification({
      userId,
      type: "system",
      title,
      message,
    });

    return true;
  } catch (error) {
    console.error("Error creating system notification:", error);
    return false;
  }
}