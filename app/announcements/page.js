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

// ISR: Cache forever unless manually revalidated
export const revalidate = false;

// Cachable data fetcher
const getCachedAnnouncements = unstable_cache(
  async () => {
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
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching announcements for ISR:", error);
      return [];
    }
  },
  ["announcements-list"], // Cache key
  { revalidate: false, tags: ["announcements"] },
);

/**
 * Announcements Page with SSR/ISR
 */
export default async function AnnouncementsPage() {
  const initialAnnouncements = await getCachedAnnouncements();

  return (
    <Suspense fallback={null}>
      <AnnouncementsClient
        initialAnnouncements={initialAnnouncements}
        initialCategory={null}
      />
    </Suspense>
  );
}
