import { db } from "@lib/firebase-admin";
import { Suspense } from "react";
import GeneralOrgClient from "@components/organization/GeneralOrgClient";

// ISR: cache indefinitely until manually revalidated
export const revalidate = false;

export const metadata = {
  title: "Lembaga Pengurusan Sekolah (LPS)",
  description:
    "Ahli Lembaga Pengurusan Sekolah (LPS) SJKC Pei Hwa Machang, Kelantan. Badan pengurusan yang memastikan kecemerlangan pentadbiran dan pembangunan sekolah.",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/organization/lps",
  },
  openGraph: {
    title: "Lembaga Pengurusan Sekolah (LPS) | SJKC Pei Hwa",
    description: "Ahli Lembaga Pengurusan Sekolah SJKC Pei Hwa Machang.",
    url: "https://sjkcpeihwa.vercel.app/organization/lps",
    siteName: "SJKC Pei Hwa",
    type: "website",
  },
};

/**
 * NOTE: Uses firebase-admin (NOT the client SDK) so the Firestore fetch goes
 * through Node's http stack that Next.js ISR can cache. The browser client SDK
 * uses WebSocket/long-poll which bypasses Next.js's fetch cache entirely.
 */
async function getLPSData() {
  try {
    const snapshot = await db.collection("LPS").orderBy("level", "asc").get();

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
