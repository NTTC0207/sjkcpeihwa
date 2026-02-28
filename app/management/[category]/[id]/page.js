import { db } from "@lib/firebase-admin";
import { notFound } from "next/navigation";
import ManagementDetailClient from "./ManagementDetailClient";
import RetirementDetailClient from "../../RetirementDetailClient";

export const revalidate = false;

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) — see announcements/page.js for details.
 */
export default async function ManagementDetailPage({ params }) {
  const { category, id } = await params;

  const isDedicatedCollection = ["persaraan", "pertukaran"].includes(category);
  const collectionName = isDedicatedCollection ? category : "management";

  let item = null;
  try {
    const docSnap = await db.collection(collectionName).doc(id).get();
    if (docSnap.exists) {
      item = { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error(`Error fetching management item ${id}:`, error);
  }

  if (!item) {
    notFound();
  }

  if (category === "persaraan") {
    return <RetirementDetailClient item={item} />;
  }

  return <ManagementDetailClient item={item} category={category} />;
}
