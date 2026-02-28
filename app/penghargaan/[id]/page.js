import { db } from "@lib/firebase-admin";
import PenghargaanDetailClient from "./PenghargaanDetailClient";
import { notFound } from "next/navigation";

// ISR: cache indefinitely until manually revalidated
export const revalidate = false;

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) — see announcements/page.js for details.
 */
async function getAward(id) {
  try {
    const snap = await db.collection("penghargaan").doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Error fetching award:", err);
    return null;
  }
}

export default async function PenghargaanDetailPage({ params }) {
  const { id } = await params;
  const award = await getAward(id);

  if (!award) {
    notFound();
  }

  return <PenghargaanDetailClient award={JSON.parse(JSON.stringify(award))} />;
}
