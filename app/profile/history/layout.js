export const metadata = {
  title: "校史 | School History",
  description:
    "Perjalanan sejarah SJKC Pei Hwa dari 1939 hingga kini. Jejaki perkembangan sekolah melalui detik-detik bersejarah yang membentuk institusi pendidikan unggul di Machang, Kelantan.",
  keywords: [
    "SJK Pei Hwa history",
    "培华小学校史",
    "校历",
    "sejarah sekolah Machang",
    "SJKC Pei Hwa Machang 1939",
  ],
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/profile/history",
  },
  openGraph: {
    title: "校史 | SJKC Pei Hwa",
    description:
      "Perjalanan sejarah SJKC Pei Hwa dari 1939 hingga kini di Machang, Kelantan.",
    url: "https://sjkcpeihwa.vercel.app/profile/history",
    siteName: "SJKC Pei Hwa",
    type: "website",
  },
};

export default function HistoryLayout({ children }) {
  return children;
}
