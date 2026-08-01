/*
Migration script: migrate-agencies-and-payments.ts

Purpose:
- Backfill payments: set payments[].pilgrimId = payments[].userId when pilgrimId is missing.
- Migrate agencies: copy documents from collection "agencies" into "users" collection using the same doc ID.
  - Ensures the destination user doc has role = "agency" and preserves existing fields where possible.
  - Does NOT delete the original agencies documents unless --delete-old is provided.

Usage:
1. Install dependencies if not already installed:
   npm install firebase-admin

2. Provide credentials to authenticate with Firestore. Either set env var GOOGLE_APPLICATION_CREDENTIALS
   to the path of a service account JSON file, or set SERVICE_ACCOUNT_JSON to the JSON string of the
   service account credentials.

3. Run the script (TypeScript execution required). Two options:
   - Using ts-node (install ts-node globally or in the project):
       npx ts-node lib/firebase/migrate-agencies-and-payments.ts
   - Or compile to JS and run with node:
       npx tsc lib/firebase/migrate-agencies-and-payments.ts --outDir dist
       node dist/lib/firebase/migrate-agencies-and-payments.js

4. Optional flag: --delete-old to remove original agencies docs after a successful copy.

Notes:
- This script uses batched writes (max 500 operations per batch) to be safe with Firestore limits.
- Review the logs and run in a test environment first. Take a backup/snapshot of Firestore if possible.
*/

import * as admin from "firebase-admin";

// Small CLI flag parsing
const args = process.argv.slice(2);
const deleteOld = args.includes("--delete-old");

function loadServiceAccount(): admin.ServiceAccount | null {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error("SERVICE_ACCOUNT_JSON is not valid JSON");
      return null;
    }
  }

  // If GOOGLE_APPLICATION_CREDENTIALS is set, firebase-admin will pick it up automatically
  return null;
}

async function initAdmin() {
  if (admin.apps.length) return admin.app();

  const sa = loadServiceAccount();

  if (sa) {
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
  } else {
    console.error(
      "No service account provided. Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file path, or SERVICE_ACCOUNT_JSON with the JSON content."
    );
    process.exit(1);
  }

  return admin.app();
}

// Utility to commit batches in chunks of 500
async function commitBatches(db: admin.firestore.Firestore, writes: admin.firestore.WriteBatch[]) {
  for (const batch of writes) {
    await batch.commit();
  }
}

async function chunkedBatches<T>(items: T[], chunkSize: number, handler: (chunk: T[]) => Promise<void>) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await handler(chunk);
  }
}

async function backfillPayments(db: admin.firestore.Firestore) {
  console.log("Starting payments backfill...");

  const paymentsRef = db.collection("payments");
  const snapshot = await paymentsRef.get();
  console.log(`Found ${snapshot.size} payment documents`);

  const updates: { ref: admin.firestore.DocumentReference; data: any }[] = [];

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    // If pilgrimId already present, skip
    if (data.pilgrimId) return;
    // If userId exists, copy it to pilgrimId
    if (data.userId) {
      updates.push({ ref: doc.ref, data: { pilgrimId: data.userId } });
    }
  });

  console.log(`Payments to update: ${updates.length}`);

  // Firestore batch limit is 500
  const batchSize = 500;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + batchSize);
    chunk.forEach((u) => batch.update(u.ref, u.data));
    await batch.commit();
    console.log(`Committed payment batch ${i / batchSize + 1}`);
  }

  console.log("Payments backfill completed.");
}

async function migrateAgencies(db: admin.firestore.Firestore) {
  console.log("Starting agencies migration...");

  const agenciesRef = db.collection("agencies");
  const snapshot = await agenciesRef.get();
  console.log(`Found ${snapshot.size} agency documents to migrate`);

  if (snapshot.empty) {
    console.log("No agencies to migrate.");
    return;
  }

  const batchLimit = 500;
  let batch = db.batch();
  let opCount = 0;

  for (let i = 0; i < snapshot.docs.length; i++) {
    const doc = snapshot.docs[i];
    const agencyData = doc.data();
    const id = doc.id;

    const userRef = db.collection("users").doc(id);

    // Merge strategy: if user exists, update/merge fields; otherwise create new user doc
    // Always ensure role: "agency"
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Prepare merge data (avoid overwriting UID/email unless present)
    const mergeData: any = { ...agencyData, role: "agency", updatedAt: now };
    if (!agencyData.createdAt) mergeData.createdAt = now;

    batch.set(userRef, mergeData, { merge: true });
    opCount++;

    if (deleteOld) {
      batch.delete(doc.ref);
      opCount++;
    }

    if (opCount >= batchLimit) {
      await batch.commit();
      console.log(`Committed batch up to agency index ${i}`);
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
    console.log(`Committed final agencies batch`);
  }

  console.log("Agencies migration completed.");
}

async function main() {
  const app = await initAdmin();
  const db = admin.firestore(app);

  try {
    await backfillPayments(db);
    await migrateAgencies(db);
    console.log("Migration finished successfully.");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(2);
  } finally {
    // Optional: close app
    try {
      await app.delete();
    } catch (_) {}
  }
}

main();
