// lib/utils/visitor-id.ts
//
// Anonymous per-browser identifier for guests submitting a custom request
// without an account. Persisted in localStorage so it's stable across visits
// and can later be used to claim guest requests once they sign up
// (see claimGuestCustomRequests in lib/firebase/services/custom-request.ts).

const VISITOR_ID_KEY = "mutamir_visitor_id";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") {
    // SSR guard — this should only ever be called from client components.
    return "";
  }

  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}