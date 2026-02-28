import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import VisitClient from "./VisitClient";

// ISR: Revalidate every 7 days (in seconds)
export const revalidate = false;

export default async function ServiceVisitPage() {
  let initialItems = [];
  try {
    const q = query(
      collection(db, "announcement"),
      where("badge", "==", "Kunjung Khidmat Bantu"),
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
    console.error("Error fetching initial visits for ISR:", error);
    initialItems = [];
  }

  return <VisitClient initialItems={initialItems} />;
}
