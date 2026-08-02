import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../config"
import type { WaitlistEntry } from "../interface/waitlist"

const WAITLIST_COLLECTION = "waitlists"

export async function addWaitlistEntry(entry: WaitlistEntry): Promise<string> {
  if (!db) throw new Error("Firestore is not initialized")

  const payload: any = {
    ...entry,
    // normalize numeric field
    estimatedMonthly:
      entry.estimatedMonthly !== undefined && entry.estimatedMonthly !== null
        ? Number(entry.estimatedMonthly)
        : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const ref = collection(db, WAITLIST_COLLECTION)
  const docRef = await addDoc(ref, payload)
  return docRef.id
}

export async function getWaitlistEntries(feature?: string): Promise<WaitlistEntry[]> {
  if (!db) throw new Error("Firestore is not initialized")

  const ref = collection(db, WAITLIST_COLLECTION)
  let q: any = ref

  if (feature) {
    q = query(ref, where("feature", "==", feature), orderBy("createdAt", "desc"))
  } else {
    q = query(ref, orderBy("createdAt", "desc"))
  }

  const snap = await getDocs(q)
  const results: WaitlistEntry[] = []

  snap.forEach((doc) => {
    const data = doc.data()
    results.push({ id: doc.id, ...(data as any) } as WaitlistEntry)
  })

  return results
}
