import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SJKC Pei Hwa | 培华国民型华文小学",
    short_name: "SJKC Pei Hwa",
    description: "Laman web rasmi SJKC Pei Hwa (培华国民型华文小学), Machang, Kelantan. Memupuk minda muda melalui kecemerlangan pendidikan.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2a589c",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
