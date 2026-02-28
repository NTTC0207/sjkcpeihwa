import { db } from "@lib/firebase-admin";
import { staffData as localStaffData } from "@lib/staffData";
import { Suspense } from "react";
import OrganizationClient from "@components/organization/OrganizationClient";

// ISR: cache indefinitely until manually revalidated
export const revalidate = false;

export const metadata = {
  title: "Carta Organisasi | Senarai Guru & Staf",
  description:
    "Carta organisasi dan senarai lengkap guru serta kakitangan SJKC Pei Hwa, Machang, Kelantan. Kenali warga pendidik kami yang berdedikasi.",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/organization",
  },
  openGraph: {
    title: "Carta Organisasi | SJKC Pei Hwa",
    description: "Senarai guru dan kakitangan SJKC Pei Hwa Machang.",
    url: "https://sjkcpeihwa.vercel.app/organization",
    siteName: "SJKC Pei Hwa",
    type: "website",
  },
};

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) so the Firestore fetch goes
 * through Node's http stack that Next.js ISR can cache. The browser client SDK
 * uses WebSocket/long-poll which bypasses Next.js's fetch cache entirely.
 */
async function getStaffData() {
  try {
    const snapshot = await db.collection("staff").orderBy("level", "asc").get();

    if (!snapshot.empty) {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by level (primary) and order (secondary)
      return data.sort((a, b) => {
        if (a.level !== b.level) return (a.level || 0) - (b.level || 0);
        return (a.order || 0) - (b.order || 0);
      });
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
