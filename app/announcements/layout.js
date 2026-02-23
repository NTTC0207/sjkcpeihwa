export const metadata = {
  title: "Pengumuman | Announcements",
  description:
    "Pengumuman terkini daripada SJKC Pei Hwa Machang, Kelantan. Berita sekolah, aktiviti ko-kurikulum, dan maklumat penting untuk ibu bapa dan pelajar.",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/announcements",
  },
  openGraph: {
    title: "Pengumuman | SJKC Pei Hwa",
    description:
      "Pengumuman terkini SJKC Pei Hwa — berita, aktiviti pelajar, dan maklumat penting.",
    url: "https://sjkcpeihwa.vercel.app/announcements",
    siteName: "SJKC Pei Hwa",
    type: "website",
  },
};

export default function AnnouncementsLayout({ children }) {
  return children;
}
