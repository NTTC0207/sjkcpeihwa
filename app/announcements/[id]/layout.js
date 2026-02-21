import { doc, getDoc } from "firebase/firestore";
import { db } from "@lib/firebase";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const docRef = doc(db, "announcement", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const title = data.title || "Pengumuman";
      const description =
        data.summary ||
        `Pengumuman daripada SJK(C) Pei Hwa Machang, Kelantan bertarikh ${data.date || ""}.`;

      return {
        title,
        description,
        alternates: {
          canonical: `https://sjkcpeihwa.vercel.app/announcements/${id}`,
        },
        openGraph: {
          title: `${title} | SJK(C) Pei Hwa`,
          description,
          url: `https://sjkcpeihwa.vercel.app/announcements/${id}`,
          siteName: "SJK(C) Pei Hwa",
          type: "article",
          publishedTime: data.date,
          images: data.image
            ? [{ url: data.image, width: 1200, height: 630, alt: title }]
            : [
                {
                  url: "/gallery/landing-hero.avif",
                  width: 1200,
                  height: 630,
                  alt: "SJK(C) Pei Hwa",
                },
              ],
        },
      };
    }
  } catch (error) {
    console.error("generateMetadata error:", error);
  }

  return {
    title: "Pengumuman | SJK(C) Pei Hwa",
    description: "Pengumuman daripada SJK(C) Pei Hwa Machang, Kelantan.",
  };
}

export default function AnnouncementDetailLayout({ children }) {
  return children;
}
