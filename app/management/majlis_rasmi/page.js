import { unstable_cache } from "next/cache";
import { db } from "@lib/firebase-admin";
import OfficialCeremonyClient from "./OfficialCeremonyClient";

export const revalidate = false;

const getCachedCeremonies = unstable_cache(
  async () => {
    const snapshot = await db
      .collection("announcement")
      .where("badge", "==", "Majlis Rasmi Sekolah")
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  ["majlis_rasmi-list"],
  {
    tags: ["majlis_rasmi", "announcements"],
    revalidate: 604800,
  },
);

export default async function OfficialCeremonyPage() {
  let initialItems = [];
  try {
    initialItems = await getCachedCeremonies();
  } catch (error) {
    console.error("Error fetching initial ceremonies for ISR:", error);
  }

  return <OfficialCeremonyClient initialItems={initialItems} />;
}
