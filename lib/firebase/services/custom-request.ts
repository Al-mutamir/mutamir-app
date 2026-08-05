// lib/firebase/services/custom-request.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config";

import type { CustomRequest } from "../interface/custom-request";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  return db;
}

/**
 * Create a custom request
 */
export async function createCustomRequest(
  request: Omit<CustomRequest, "id">
): Promise<string> {
  try {
    const firestore = checkDb();

    const docRef = await addDoc(collection(firestore, "customRequests"), {
      ...request,
      status: request.status ?? "pending",
      confirmationSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating custom request:", error);
    throw error;
  }
}

/**
 * Get custom request by ID
 */
export async function getCustomRequestById(
  requestId: string
): Promise<CustomRequest | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDoc(doc(firestore, "customRequests", requestId));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<CustomRequest, "id">),
    };
  } catch (error) {
    console.error("Error getting custom request:", error);
    return null;
  }
}

/**
 * Get custom requests belonging to a signed-in user
 */
export async function getCustomRequestsByUser(
  userId: string
): Promise<CustomRequest[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "customRequests"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CustomRequest, "id">),
    }));
  } catch (error) {
    console.error("Error getting user's custom requests:", error);
    return [];
  }
}

/**
 * Get custom requests belonging to a guest (matched by visitor id).
 * Useful for merging guest requests into a user's account after they sign up.
 */
export async function getCustomRequestsByVisitor(
  visitorId: string
): Promise<CustomRequest[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "customRequests"),
        where("visitorId", "==", visitorId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CustomRequest, "id">),
    }));
  } catch (error) {
    console.error("Error getting visitor's custom requests:", error);
    return [];
  }
}

/**
 * Update custom request status
 */
export async function updateCustomRequestStatus(
  requestId: string,
  status: CustomRequest["status"]
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "customRequests", requestId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating custom request status:", error);
    throw error;
  }
}

/**
 * Attach a signed-in user's UID to requests they made as a guest,
 * e.g. right after they log in or register with the same visitor id.
 */
export async function claimGuestCustomRequests(
  visitorId: string,
  userId: string
): Promise<void> {
  try {
    const firestore = checkDb();

    const guestRequests = await getCustomRequestsByVisitor(visitorId);

    await Promise.all(
      guestRequests.map((request) =>
        request.id
          ? updateDoc(doc(firestore, "customRequests", request.id), {
              userId,
              isGuest: false,
              updatedAt: serverTimestamp(),
            })
          : Promise.resolve()
      )
    );
  } catch (error) {
    console.error("Error claiming guest custom requests:", error);
    throw error;
  }
}

/**
 * Mark that the confirmation email was sent for a request.
 * Best-effort — failures here should never block the user-facing flow.
 */
export async function markCustomRequestConfirmationSent(
  requestId: string
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "customRequests", requestId), {
      confirmationSent: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error marking custom request confirmation as sent:", error);
  }
}