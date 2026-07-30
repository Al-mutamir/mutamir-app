// lib/firebase/services/booking.ts

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

import type { Booking } from "../interface/booking";

function checkDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  return db;
}

/**
 * Get all bookings
 */
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(collection(firestore, "bookings"), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));
  } catch (error) {
    console.error("Error getting bookings:", error);
    return [];
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(
  bookingId: string
): Promise<Booking | null> {
  try {
    const firestore = checkDb();

    const snapshot = await getDoc(doc(firestore, "bookings", bookingId));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Booking, "id">),
    };
  } catch (error) {
    console.error("Error getting booking:", error);
    return null;
  }
}

/**
 * Get bookings belonging to an agency
 */
export async function getBookingsByAgency(
  agencyId: string
): Promise<Booking[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "bookings"),
        where("agencyId", "==", agencyId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));
  } catch (error) {
    console.error("Error getting agency bookings:", error);
    return [];
  }
}

/**
 * Get bookings belonging to a pilgrim
 */
export async function getBookingsByPilgrim(
  pilgrimId: string
): Promise<Booking[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "bookings"),
        where("pilgrimId", "==", pilgrimId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));
  } catch (error) {
    console.error("Error getting pilgrim bookings:", error);
    return [];
  }
}

/**
 * Get bookings for a package
 */
export async function getBookingsByPackage(
  packageId: string
): Promise<Booking[]> {
  try {
    const firestore = checkDb();

    const snapshot = await getDocs(
      query(
        collection(firestore, "bookings"),
        where("packageId", "==", packageId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));
  } catch (error) {
    console.error("Error getting package bookings:", error);
    return [];
  }
}

/**
 * Create booking
 */
export async function createBooking(
  booking: Omit<Booking, "id">
): Promise<string> {
  try {
    const firestore = checkDb();

    const docRef = await addDoc(collection(firestore, "bookings"), {
      ...booking,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Update booking
 */
export async function updateBooking(
  bookingId: string,
  data: Partial<Booking>
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "bookings", bookingId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"]
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "bookings", bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}

/**
 * Update booking payment
 */
export async function updateBookingPayment(
  bookingId: string,
  payment: {
    paymentStatus: Booking["paymentStatus"];
    paymentReference?: string;
    paymentMethod?: string;
  }
): Promise<void> {
  try {
    const firestore = checkDb();

    await updateDoc(doc(firestore, "bookings", bookingId), {
      paymentStatus: payment.paymentStatus,
      paymentReference: payment.paymentReference ?? null,
      paymentMethod: payment.paymentMethod ?? null,
      paymentDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating booking payment:", error);
    throw error;
  }
}