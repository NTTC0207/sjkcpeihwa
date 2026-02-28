import { Suspense } from "react";
import { db } from "@lib/firebase-admin";
import PenghargaanClient from "./PenghargaanClient";

// ISR: Revalidate every 7 days (60*60*24*7)
export const revalidate = 604800;

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) so the Firestore fetch goes
 * through Node's http stack that Next.js ISR can cache. The browser client SDK
 * uses WebSocket/long-poll which bypasses Next.js's fetch cache entirely.
 */
export default async function PenghargaanPage() {
  let initialAwards = [];
  try {
    const snapshot = await db
      .collection("penghargaan")
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    initialAwards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching initial awards for ISR:", error);
    initialAwards = [];
  }

  return (
    <Suspense fallback={null}>
      <PenghargaanClient initialAwards={initialAwards} />
    </Suspense>
  );
}
