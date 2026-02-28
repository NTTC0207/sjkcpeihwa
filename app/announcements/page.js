import { Suspense } from "react";
import { db } from "@lib/firebase-admin";
import AnnouncementsClient from "./AnnouncementsClient";

// ISR: Revalidate every 7 days (60 * 60 * 24 * 7)
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
 *
 * NOTE: We use firebase-admin (NOT the client SDK) here so that this fetch
 * goes through Node's native fetch infrastructure, which Next.js ISR can
 * actually cache. The client SDK uses WebSocket/long-poll which bypasses
 * Next.js's fetch cache entirely, breaking ISR.
 */
export default async function AnnouncementsPage() {
  let initialAnnouncements = [];
  try {
    const ALLOWED_BADGES = [
      "Penting",
      "Acara",
      "Mesyuarat",
      "Cuti",
      "Berita",
      "Notis",
      "Pekeliling",
    ];

    const snapshot = await db
      .collection("announcement")
      .where("badge", "in", ALLOWED_BADGES)
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    initialAnnouncements = snapshot.docs.map((doc) => ({
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
