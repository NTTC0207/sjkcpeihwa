import "./globals.css";
import ClientLayout from "@components/ClientLayout";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Root Layout
 * Defines the HTML structure and metadata for the entire application
 */
export const metadata = {
  metadataBase: new URL("https://sjkcpeihwa.vercel.app"),
  title: {
    default: "SJKC Pei Hwa | 培华国民型华文小学",
    template: "%s | SJKC Pei Hwa",
  },
  siteName: "SJKC Pei Hwa",
  description:
    "Laman web rasmi SJKC Pei Hwa (培华国民型华文小学), Machang, Kelantan. Memupuk minda muda melalui kecemerlangan pendidikan, pembinaan karakter, dan warisan budaya.",
  applicationName: "SJKC Pei Hwa",
  appleWebApp: {
    capable: true,
    title: "SJKC Pei Hwa",
    statusBarStyle: "default",
  },
  keywords: [
    "SJKC Pei Hwa",
    "SJKC Pei Hwa Machang",
    "Pei Hwa Machang",
    "培华小学",
    "培华华小",
    "SJKC Pei Hwa",
    "SJK Pei Hwa Machang",
    "培华国民型华文小学",
    "Sekolah Rendah Machang",
    "Kelantan Primary School",
    "Sekolah Cina Kelantan",
    "Machang Kelantan",
    "吉兰丹马章培华小学",
    "吉兰丹华小",
    "马章华小",
    "马章培华华小",
    "马章培华小学",
  ],
  authors: [{ name: "SJKC Pei Hwa" }],
  creator: "SJKC Pei Hwa",
  publisher: "SJKC Pei Hwa",
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
    title: "SJKC Pei Hwa | 培华国民型华文小学",
    description:
      "Laman web rasmi SJKC Pei Hwa - Memupuk Minda Muda, Membina Masa Depan Cerah. 培育英才，共创辉煌。",
    url: "https://sjkcpeihwa.vercel.app",
    siteName: "SJKC Pei Hwa",
    images: [
      {
        url: "/gallery/landing-hero.avif",
        width: 1200,
        height: 630,
        alt: "SJKC Pei Hwa School Building - 培华国民型华文小学",
      },
    ],
    locale: "zh_CN",
    alternateLocale: ["ms_MY", "en_MY"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SJKC Pei Hwa | 培华国民型华文小学",
    description:
      "Laman web rasmi SJKC Pei Hwa - Memupuk Minda Muda, Membina Masa Depan Cerah.",
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
  verification: {
    google: "IjHr8sJ7bUL3F_A49Vat-6dCO--y9aHSlA6wS21KVuQ",
  },
};

export const viewport = {
  themeColor: "#2a589c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const schoolJsonLd = {
    "@context": "https://schema.org",
    "@type": "ElementarySchool",
    name: "SJKC Pei Hwa",
    alternateName: [
      "培华国民型华文小学",
      "SJKC Pei Hwa Machang",
      "SJKC Pei Hwa Machang",
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
      "Laman web rasmi SJKC Pei Hwa (培华国民型华文小学), Machang, Kelantan. Sekolah rendah jenis kebangsaan Cina yang menawarkan pendidikan berkualiti tinggi.",
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

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://sjkcpeihwa.vercel.app/#website",
    name: "SJKC Pei Hwa",
    alternateName: ["培华国民型华文小学", "SJKC Pei Hwa"],
    url: "https://sjkcpeihwa.vercel.app",
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M9CXCS6NWJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M9CXCS6NWJ');
          `}
        </Script>
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
