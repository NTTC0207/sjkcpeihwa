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

// ISR: Revalidate every 7 days (in seconds)
export const revalidate = 604800;

/**
 * Announcements Page with ISR (Incremental Static Regeneration)
 *
 * IMPORTANT: We intentionally do NOT read `searchParams` here.
 * Reading searchParams in a Next.js Server Component opts the page into
 * dynamic (SSR) rendering, which disables ISR caching entirely.
 *
 * Strategy:
 *  - Server fetches the latest 20 announcements (no category filter) and
 *    caches them for 7 days via ISR.
 *  - Category filtering and pagination are handled 100% on the client side,
 *    using the cached data first, then fetching from Firebase only if required.
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
    console.error("Error fetching initial announcements for ISR:", error);
    initialAnnouncements = [];
  }

  return (
    <Suspense fallback={null}>
      <AnnouncementsClient
        initialAnnouncements={initialAnnouncements}
        initialCategory={null}
      />
    </Suspense>
  );
}
