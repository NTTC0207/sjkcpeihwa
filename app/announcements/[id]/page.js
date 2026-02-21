import { doc, getDoc } from "firebase/firestore";
import { db } from "@lib/firebase";
import { notFound } from "next/navigation";
import AnnouncementDetailClient from "./AnnouncementDetailClient";

// ISR: Revalidate every 7 days
export const revalidate = 604800;

/**
 * Announcement Detail Page with ISR
 */
export default async function AnnouncementDetailPage({ params }) {
  const { id } = await params;

  let announcement = null;
  try {
    const docRef = doc(db, "announcement", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
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
