import { Suspense } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@lib/firebase";
import PenghargaanClient from "./PenghargaanClient";

// ISR: Revalidate every 7 days (60*60*24*7)
export const revalidate = false;

export default async function PenghargaanPage() {
  let initialAwards = [];
  try {
    const q = query(
      collection(db, "penghargaan"),
      orderBy("date", "desc"),
      orderBy("__name__", "desc"),
      limit(20),
    );
    const querySnapshot = await getDocs(q);
    initialAwards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching initial awards for ISR:", error);
    initialAwards = [];
  }

  return (
    <Suspense fallback={null}>
      <PenghargaanClient initialAwards={initialAwards} />
    </Suspense>
  );
}
