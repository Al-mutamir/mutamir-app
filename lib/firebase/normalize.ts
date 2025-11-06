// Normalization helper for Firestore documents
export function normalizeDoc(docId: string, data: any) {
  if (!data) return { id: docId, uid: docId }

  const out: any = { ...data }
  // Ensure identifier fields
  out.id = docId
  out.uid = docId

  // Normalize timestamps: if Firestore Timestamp-like, convert to ISO string and Date
  const ts = data.createdAt || data.created_at || data.created || null
  if (ts && typeof ts === "object" && typeof (ts as any).toDate === "function") {
    const d = (ts as any).toDate()
    out.createdAt = d.toISOString()
    out.createdAtDate = d
  } else if (ts && typeof ts === "string") {
    const d = new Date(ts)
    if (!isNaN(d.getTime())) {
      out.createdAt = d.toISOString()
      out.createdAtDate = d
    } else {
      out.createdAt = ts
    }
  } else if (ts instanceof Date) {
    out.createdAt = ts.toISOString()
    out.createdAtDate = ts
  } else if (!out.createdAt) {
    // leave undefined if not present
  }

  return out
}
