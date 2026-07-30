// lib/firebase/services/payment.ts

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

import type { Payment } from "../interface/payment";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }

  return db;
}

/**
 * Get all payments
 */
export async function getAllPayments(): Promise<Payment[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "payments"),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Payment, "id">),
    }));
  } catch (error) {
    console.error("Error getting payments:", error);
    return [];
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(
  paymentId: string
): Promise<Payment | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDoc(doc(firestore, "payments", paymentId));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Payment, "id">),
    };
  } catch (error) {
    console.error("Error getting payment:", error);
    return null;
  }
}

/**
 * Get payments by pilgrim
 */
export async function getPaymentsByPilgrim(
  pilgrimId: string
): Promise<Payment[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "payments"),
        where("pilgrimId", "==", pilgrimId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Payment, "id">),
    }));
  } catch (error) {
    console.error("Error getting pilgrim payments:", error);
    return [];
  }
}

/**
 * Get payments by agency
 */
export async function getPaymentsByAgency(
  agencyId: string
): Promise<Payment[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "payments"),
        where("agencyId", "==", agencyId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Payment, "id">),
    }));
  } catch (error) {
    console.error("Error getting agency payments:", error);
    return [];
  }
}

/**
 * Get payments by booking
 */
export async function getPaymentsByBooking(
  bookingId: string
): Promise<Payment[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "payments"),
        where("bookingId", "==", bookingId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Payment, "id">),
    }));
  } catch (error) {
    console.error("Error getting booking payments:", error);
    return [];
  }
}

/**
 * Record a payment
 */
export async function createPayment(
  paymentData: Omit<Payment, "id">
): Promise<string> {
  try {
    const firestore = checkDb();

    const docRef = await addDoc(collection(firestore, "payments"), {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

/**
 * Update payment
 */
export async function updatePayment(
  paymentId: string,
  data: Partial<Payment>
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "payments", paymentId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment["status"]
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "payments", paymentId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}