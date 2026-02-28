import { unstable_cache } from "next/cache";
import { db } from "@lib/firebase-admin";
import LandingPage from "@components/LandingPage";

// ISR: static until on-demand revalidation via tags
export const revalidate = false;

/**
 * Cached Firestore fetch for latest announcements on landing page.
 * Survives deployments and only re-runs when invalidated.
 */
const getLatestAnnouncements = unstable_cache(
  async () => {
    const snapshot = await db
      .collection("announcement")
      .where("badge", "in", [
        "Penting",
        "Acara",
        "Mesyuarat",
        "Cuti",
        "Berita",
        "Notis",
        "Pekeliling",
      ])
      .orderBy("date", "desc")
      .limit(3)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  ["latest-announcements"],
  {
    tags: ["announcements"],
    revalidate: false, // 7 days fallback
  },
);

/**
 * Home Page
 * Main entry point for the Peihwa Primary School website
 */
export default async function Home() {
  let initialAnnouncements = [];
  try {
    initialAnnouncements = await getLatestAnnouncements();
  } catch (error) {
    console.error("Error fetching initial announcements for Home ISR:", error);
  }

  return <LandingPage initialAnnouncements={initialAnnouncements} />;
}
