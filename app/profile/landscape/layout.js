export const metadata = {
  title: "Landskap Sekolah | Campus Gallery",
  description:
    "Galeri gambar kampus SJK(C) Pei Hwa Machang, Kelantan. Terokai kemudahan moden dan persekitaran pembelajaran yang kondusif di sekolah kami.",
  alternates: {
    canonical: "https://sjkcpeihwa.edu.my/profile/landscape",
  },
  openGraph: {
    title: "Landskap Kampus | SJK(C) Pei Hwa",
    description:
      "Galeri gambar kampus SJK(C) Pei Hwa Machang — kemudahan moden, perpustakaan, dan persekitaran sekolah.",
    url: "https://sjkcpeihwa.edu.my/profile/landscape",
    images: [
      {
        url: "/gallery/frontview.avif",
        width: 1200,
        height: 800,
        alt: "SJK(C) Pei Hwa Campus Front View",
      },
    ],
    type: "website",
  },
};

export default function LandscapeLayout({ children }) {
  return children;
}
