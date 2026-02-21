import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@lib/firebase";
import { staffData as localStaffData } from "@lib/staffData";
import { Suspense } from "react";
import OrganizationClient from "@components/organization/OrganizationClient";

// ISR: Revalidate every 7 days (60*60*24*7)
export const revalidate = 604800;

export const metadata = {
  title: "Carta Organisasi | Senarai Guru & Staf",
  description:
    "Carta organisasi dan senarai lengkap guru serta kakitangan SJK(C) Pei Hwa, Machang, Kelantan. Kenali warga pendidik kami yang berdedikasi.",
  alternates: {
    canonical: "https://sjkcpeihwa.edu.my/organization",
  },
  openGraph: {
    title: "Carta Organisasi | SJK(C) Pei Hwa",
    description: "Senarai guru dan kakitangan SJK(C) Pei Hwa Machang.",
    url: "https://sjkcpeihwa.edu.my/organization",
    type: "website",
  },
};

async function getStaffData() {
  try {
    const q = query(collection(db, "staff"), orderBy("level", "asc"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
    return localStaffData;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return localStaffData;
  }
}

export default async function OrganizationPage() {
  const staffData = await getStaffData();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <OrganizationClient initialStaffData={staffData} />
    </Suspense>
  );
}
