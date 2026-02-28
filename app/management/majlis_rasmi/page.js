import { db } from "@lib/firebase-admin";
import OfficialCeremonyClient from "./OfficialCeremonyClient";

// ISR: cache indefinitely until manually revalidated
export const revalidate = false;

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) so the Firestore fetch goes
 * through Node's http stack that Next.js ISR can cache. The browser client SDK
 * uses WebSocket/long-poll which bypasses Next.js's fetch cache entirely.
 */
export default async function OfficialCeremonyPage() {
  let initialItems = [];
  try {
    const snapshot = await db
      .collection("announcement")
      .where("badge", "==", "Majlis Rasmi Sekolah")
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    initialItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching initial ceremonies for ISR:", error);
    initialItems = [];
  }

  return <OfficialCeremonyClient initialItems={initialItems} />;
}
