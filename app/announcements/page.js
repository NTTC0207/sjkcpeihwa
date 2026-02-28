import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@lib/firebase-admin";
import AnnouncementsClient from "./AnnouncementsClient";

// Tell Next.js this page is statically generated (ISR).
// The actual TTL is controlled by the unstable_cache revalidate below.
export const revalidate = false; // static until on-demand revalidation

const ALLOWED_BADGES = [
  "Penting",
  "Acara",
  "Mesyuarat",
  "Cuti",
  "Berita",
  "Notis",
  "Pekeliling",
];

/**
 * Cached Firestore fetch — survives deployments and only re-runs when the
 * "announcements" cache tag is invalidated via revalidateTag() in the admin
 * panel API route.
 *
 * WHY unstable_cache:
 *   `export const revalidate` only caches data loaded via fetch().
 *   Firebase Admin SDK uses gRPC (not fetch), so Next.js cannot intercept it.
 *   unstable_cache wraps ANY async function and stores the result in the
 *   Next.js Data Cache so ISR works correctly with the Admin SDK.
 */
const getCachedAnnouncements = unstable_cache(
  async () => {
    const snapshot = await db
      .collection("announcement")
      .where("badge", "in", ALLOWED_BADGES)
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  ["announcements-list"], // cache key
  {
    tags: ["announcements"], // invalidated by revalidateTag("announcements")
    revalidate: 604800, // fallback TTL: 7 days
  },
);

export default async function AnnouncementsPage() {
  let initialAnnouncements = [];
  try {
    initialAnnouncements = await getCachedAnnouncements();
  } catch (error) {
    console.error("Error fetching initial announcements for ISR:", error);
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
