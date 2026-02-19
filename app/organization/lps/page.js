import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@lib/firebase";
import { Suspense } from "react";
import GeneralOrgClient from "@components/organization/GeneralOrgClient";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

async function getLPSData() {
  try {
    const q = query(collection(db, "LPS"), orderBy("level", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching LPS data:", error);
    return [];
  }
}

export default async function LPSPage() {
  const lpsData = await getLPSData();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <GeneralOrgClient
        initialData={lpsData}
        translationKey="lps"
        showFilters={false}
        showSubjects={false}
      />
    </Suspense>
  );
}
