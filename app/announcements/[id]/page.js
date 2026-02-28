import { db } from "@lib/firebase-admin";
import { notFound } from "next/navigation";
import AnnouncementDetailClient from "./AnnouncementDetailClient";

// ISR: cache indefinitely until manually revalidated
export const revalidate = false;

/**
 * Announcement Detail Page with ISR
 * NOTE: Uses firebase-admin (NOT the client SDK) — see announcements/page.js for details.
 */
export default async function AnnouncementDetailPage({ params }) {
  const { id } = await params;

  let announcement = null;
  try {
    const docSnap = await db.collection("announcement").doc(id).get();
    if (docSnap.exists) {
      announcement = { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("Error fetching announcement for ISR:", error);
  }

  if (!announcement) {
    notFound();
  }

  return <AnnouncementDetailClient announcement={announcement} />;
}
