import { Suspense } from "react";
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

import { unstable_cache } from "next/cache";

// ISR: Cache forever (build-time only)
export const revalidate = false;

/**
 * Announcements Page with Static Generation
 */
export default async function AnnouncementsPage() {
  let initialAnnouncements = [];
  try {
    const q = query(
      collection(db, "announcement"),
      where("badge", "in", [
        "Penting",
        "Acara",
        "Mesyuarat",
        "Cuti",
        "Berita",
        "Notis",
        "Pekeliling",
      ]),
      orderBy("date", "desc"),
      orderBy("__name__", "desc"),
      limit(20),
    );
    const querySnapshot = await getDocs(q);
    initialAnnouncements = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching announcements for Static Generation:", error);
    initialAnnouncements = [];
  }

  return (
    <Suspense fallback={null}>
      <AnnouncementsClient initialAnnouncements={initialAnnouncements} />
    </Suspense>
  );
}
