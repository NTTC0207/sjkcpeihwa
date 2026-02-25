import { db } from "@lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import PenghargaanDetailClient from "./PenghargaanDetailClient";
import { notFound } from "next/navigation";

export const revalidate = false; // 7 days

async function getAward(id) {
  try {
    const docRef = doc(db, "penghargaan", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Error fetching award:", err);
    return null;
  }
}

export default async function PenghargaanDetailPage({ params }) {
  const { id } = await params;
  const award = await getAward(id);

  if (!award) {
    notFound();
  }

  return <PenghargaanDetailClient award={JSON.parse(JSON.stringify(award))} />;
}
