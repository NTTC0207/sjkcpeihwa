import "./globals.css";
import ClientLayout from "@components/ClientLayout";

/**
 * Root Layout
 * Defines the HTML structure and metadata for the entire application
 */
export const metadata = {
  metadataBase: new URL("https://sjkcpeihwa.vercel.app"),
  title: {
    default: "SJK(C) Pei Hwa | 培华国民型华文小学",
    template: "%s | SJK(C) Pei Hwa",
  },
  description:
    "Laman web rasmi SJK(C) Pei Hwa (培华国民型华文小学), Machang, Kelantan. Memupuk minda muda melalui kecemerlangan pendidikan, pembinaan karakter, dan warisan budaya.",
  keywords: [
    "SJKC Pei Hwa",
    "培华小学",
    "SJK(C) Pei Hwa",
    "SJK Pei Hwa Machang",
    "培华国民型华文小学",
    "Sekolah Rendah Machang",
    "Kelantan Primary School",
    "Chinese Primary School Malaysia",
    "Chinese Primary School Kelantan",
    "Sekolah Cina Kelantan",
    "Machang Kelantan",
    "Education Malaysia",
    "华文小学马来西亚",
    "吉兰丹华小",
    "马章华小",
  ],
  authors: [{ name: "SJK(C) Pei Hwa" }],
  creator: "SJK(C) Pei Hwa",
  publisher: "SJK(C) Pei Hwa",
  alternates: {
    canonical: "https://sjkcpeihwa.vercel.app",
    languages: {
      "zh-CN": "https://sjkcpeihwa.vercel.app",
      "ms-MY": "https://sjkcpeihwa.vercel.app",
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SJK(C) Pei Hwa | 培华国民型华文小学",
    description:
      "Laman web rasmi SJK(C) Pei Hwa - Memupuk Minda Muda, Membina Masa Depan Cerah. 培育英才，共创辉煌。",
    url: "https://sjkcpeihwa.vercel.app",
    siteName: "SJK(C) Pei Hwa",
    images: [
      {
        url: "/gallery/landing-hero.avif",
        width: 1200,
        height: 630,
        alt: "SJK(C) Pei Hwa School Building - 培华国民型华文小学",
      },
    ],
    locale: "zh_CN",
    alternateLocale: ["ms_MY", "en_MY"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SJK(C) Pei Hwa | 培华国民型华文小学",
    description:
      "Laman web rasmi SJK(C) Pei Hwa - Memupuk Minda Muda, Membina Masa Depan Cerah.",
    images: ["/gallery/landing-hero.avif"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "education",
};

export const viewport = {
  themeColor: "#4F46E5", // Matching the primary color
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElementarySchool",
    name: "SJK(C) Pei Hwa",
    alternateName: [
      "培华国民型华文小学",
      "SJKC Pei Hwa Machang",
      "SJK(C) Pei Hwa Machang",
    ],
    url: "https://sjkcpeihwa.vercel.app",
    logo: {
      "@type": "ImageObject",
      url: "https://sjkcpeihwa.vercel.app/logo.png",
      width: 200,
      height: 200,
    },
    image: "https://sjkcpeihwa.vercel.app/gallery/landing-hero.avif",
    description:
      "Laman web rasmi SJK(C) Pei Hwa (培华国民型华文小学), Machang, Kelantan. Sekolah rendah jenis kebangsaan Cina yang menawarkan pendidikan berkualiti tinggi.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Machang",
      addressLocality: "Machang",
      addressRegion: "Kelantan",
      postalCode: "18500",
      addressCountry: "MY",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 5.7667,
      longitude: 102.2167,
    },
    telephone: "+609-9751046",
    email: "dbc2185@moe.edu.my",
    foundingDate: "1939",
    educationalCredentialAwarded: "Primary School Certificate (UPSR)",
    teaches: [
      "Mathematics",
      "Science",
      "Chinese Language",
      "Bahasa Malaysia",
      "English",
    ],
    sameAs: ["https://sjkcpeihwa.vercel.app"],
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
