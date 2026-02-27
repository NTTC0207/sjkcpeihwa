import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import OfficialCeremonyClient from "./OfficialCeremonyClient";

// ISR: Revalidate every 7 days (in seconds)
export const revalidate = 604800;

export default async function OfficialCeremonyPage() {
  let initialItems = [];
  try {
    const q = query(
      collection(db, "announcement"),
      where("badge", "==", "Majlis Rasmi Sekolah"),
      orderBy("date", "desc"),
      orderBy("__name__", "desc"),
      limit(20),
    );
    const querySnapshot = await getDocs(q);
    initialItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching initial ceremonies for ISR:", error);
    initialItems = [];
  }

  return <OfficialCeremonyClient initialItems={initialItems} />;
}
