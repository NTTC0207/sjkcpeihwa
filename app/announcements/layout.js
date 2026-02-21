export const metadata = {
  title: "Pengumuman | Announcements",
  description:
    "Pengumuman terkini daripada SJK(C) Pei Hwa Machang, Kelantan. Berita sekolah, aktiviti ko-kurikulum, dan maklumat penting untuk ibu bapa dan pelajar.",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/announcements",
  },
  openGraph: {
    title: "Pengumuman | SJK(C) Pei Hwa",
    description:
      "Pengumuman terkini SJK(C) Pei Hwa — berita, aktiviti pelajar, dan maklumat penting.",
    url: "https://sjkcpeihwa.vercel.app/announcements",
    siteName: "SJK(C) Pei Hwa",
    type: "website",
  },
};

export default function AnnouncementsLayout({ children }) {
  return children;
}
