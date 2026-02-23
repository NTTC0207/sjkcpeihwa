import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@lib/firebase";
import { Suspense } from "react";
import GeneralOrgClient from "@components/organization/GeneralOrgClient";

// ISR: Revalidate every 7 days (60*60*24*7)
export const revalidate = false;

export const metadata = {
  title: "Persatuan Ibu Bapa & Guru (PTA / PIBG)",
  description:
    "Ahli Persatuan Ibu Bapa dan Guru (PIBG) SJKC Pei Hwa Machang, Kelantan. Kerjasama antara ibu bapa dan guru demi kecemerlangan pelajar.",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/organization/pta",
  },
  openGraph: {
    title: "PIBG / PTA | SJKC Pei Hwa",
    description: "Persatuan Ibu Bapa dan Guru SJKC Pei Hwa Machang.",
    url: "https://sjkcpeihwa.vercel.app/organization/pta",
    siteName: "SJKC Pei Hwa",
    type: "website",
  },
};

async function getPTAData() {
  try {
    const q = query(collection(db, "PTA"), orderBy("level", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by level (primary) and order (secondary)
      return data.sort((a, b) => {
        if (a.level !== b.level) return (a.level || 0) - (b.level || 0);
        return (a.order || 0) - (b.order || 0);
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching PTA data:", error);
    return [];
  }
}

export default async function PTAPage() {
  const ptaData = await getPTAData();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <GeneralOrgClient
        initialData={ptaData}
        translationKey="pta"
        showFilters={false}
        showSubjects={false}
      />
    </Suspense>
  );
}
