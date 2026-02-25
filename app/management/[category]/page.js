import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import ManagementClient from "../ManagementClient";
import RetirementClient from "../RetirementClient";

export const revalidate = false; // Disable ISR, always fetch fresh data

export default async function ManagementPage({ params }) {
  const { category } = await params;
  let initialItems = [];

  const isDedicatedCollection = ["persaraan", "pertukaran"].includes(category);
  const collectionName = isDedicatedCollection ? category : "management";

  try {
    let q;
    if (isDedicatedCollection) {
      q = query(
        collection(db, collectionName),
        orderBy("date", "desc"),
        limit(5),
      );
    } else {
      q = query(
        collection(db, "management"),
        where("category", "==", category),
        orderBy("date", "desc"),
        limit(5),
      );
    }
    const querySnapshot = await getDocs(q);
    initialItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching management items for ${category}:`, error);
  }

  if (category === "persaraan") {
    return <RetirementClient initialItems={initialItems} />;
  }

  return <ManagementClient initialItems={initialItems} category={category} />;
}
