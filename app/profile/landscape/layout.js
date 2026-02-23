export const metadata = {
  title: "Landskap Sekolah | Campus Gallery",
  description:
    "Galeri gambar kampus SJKC Pei Hwa Machang, Kelantan. Terokai kemudahan moden dan persekitaran pembelajaran yang kondusif di sekolah kami.",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app/profile/landscape",
  },
  openGraph: {
    title: "Landskap Kampus | SJKC Pei Hwa",
    description:
      "Galeri gambar kampus SJKC Pei Hwa Machang — kemudahan moden, perpustakaan, dan persekitaran sekolah.",
    url: "https://sjkcpeihwa.vercel.app/profile/landscape",
    siteName: "SJKC Pei Hwa",
    images: [
      {
        url: "/gallery/frontview.avif",
        width: 1200,
        height: 800,
        alt: "SJKC Pei Hwa Campus Front View",
      },
    ],
    type: "website",
  },
};

export default function LandscapeLayout({ children }) {
  return children;
}
