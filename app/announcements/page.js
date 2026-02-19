import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import AnnouncementsClient from "./AnnouncementsClient";

// ISR: Revalidate every 7 days (in seconds)
export const revalidate = 604800;

/**
 * Announcements Page with ISR (Incremental Static Regeneration)
 * Initial data is fetched on the server for speed and SEO.
 * Subsequent pagination and filtering arthee handled by the client component.
 */
export default async function AnnouncementsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || null;

  let initialAnnouncements = [];
  try {
    const constraints = [
      orderBy("date", "desc"),
      orderBy("__name__", "desc"),
      limit(5),
    ];
    if (category) {
      constraints.unshift(where("department", "==", category));
    }
    const q = query(collection(db, "announcement"), ...constraints);
    const querySnapshot = await getDocs(q);
    initialAnnouncements = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching initial announcements for ISR:", error);
    // Fallback to empty if fetch fails during build/regeneration
    initialAnnouncements = [];
  }

  return (
    <AnnouncementsClient
      initialAnnouncements={initialAnnouncements}
      initialCategory={category}
    />
  );
}
