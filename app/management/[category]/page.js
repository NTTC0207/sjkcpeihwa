import { db } from "@lib/firebase-admin";
import ManagementClient from "../ManagementClient";
import RetirementClient from "../RetirementClient";
import TimelineClient from "../TimelineClient";

export const revalidate = false; // cache indefinitely until manually revalidated

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) so the Firestore fetch goes
 * through Node's http stack that Next.js ISR can cache. The browser client SDK
 * uses WebSocket/long-poll which bypasses Next.js's fetch cache entirely.
 */
export default async function ManagementPage({ params }) {
  const { category } = await params;
  let initialItems = [];

  const isDedicatedCollection = ["persaraan", "pertukaran"].includes(category);
  const collectionName = isDedicatedCollection ? category : "management";

  try {
    let query;
    if (isDedicatedCollection) {
      query = db.collection(collectionName).orderBy("date", "desc").limit(20);
    } else {
      query = db
        .collection("management")
        .where("category", "==", category)
        .orderBy("date", "desc")
        .limit(20);
    }
    const snapshot = await query.get();
    initialItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching management items for ${category}:`, error);
  }

  if (category === "persaraan") {
    return <RetirementClient initialItems={initialItems} />;
  }

  if (["bangunan", "penyelenggaraan"].includes(category)) {
    return <TimelineClient initialItems={initialItems} category={category} />;
  }

  return <ManagementClient initialItems={initialItems} category={category} />;
}
