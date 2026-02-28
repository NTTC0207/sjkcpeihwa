import { unstable_cache } from "next/cache";
import { db } from "@lib/firebase-admin";
import VisitClient from "./VisitClient";

export const revalidate = false;

const getCachedVisits = unstable_cache(
  async () => {
    const snapshot = await db
      .collection("announcement")
      .where("badge", "==", "Kunjung Khidmat Bantu")
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  ["khidmat_bantu-list"],
  {
    tags: ["khidmat_bantu", "announcements"],
    revalidate: 604800,
  },
);

export default async function ServiceVisitPage() {
  let initialItems = [];
  try {
    initialItems = await getCachedVisits();
  } catch (error) {
    console.error("Error fetching initial visits for ISR:", error);
  }

  return <VisitClient initialItems={initialItems} />;
}
