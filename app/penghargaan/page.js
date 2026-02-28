import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@lib/firebase-admin";
import PenghargaanClient from "./PenghargaanClient";

export const revalidate = false;

const getCachedAwards = unstable_cache(
  async () => {
    const snapshot = await db
      .collection("penghargaan")
      .orderBy("date", "desc")
      .orderBy("__name__", "desc")
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  ["penghargaan-list"],
  {
    tags: ["penghargaan"],
    revalidate: 604800,
  },
);

export default async function PenghargaanPage() {
  let initialAwards = [];
  try {
    initialAwards = await getCachedAwards();
  } catch (error) {
    console.error("Error fetching initial awards for ISR:", error);
  }

  return (
    <Suspense fallback={null}>
      <PenghargaanClient initialAwards={initialAwards} />
    </Suspense>
  );
}
