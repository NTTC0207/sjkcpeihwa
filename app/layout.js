import "./globals.css";
import ClientLayout from "@components/ClientLayout";

/**
 * Root Layout
 * Defines the HTML structure and metadata for the entire application
 */
export const metadata = {
  title: "Peihwa Primary School | Nurturing Young Minds",
  description:
    "Welcome to Peihwa Primary School - A place where learning comes alive. We provide quality education in a nurturing and inclusive environment.",
  keywords: "Peihwa, Primary School, Education, Malaysia, Chinese School, SJKC",
  authors: [{ name: "Peihwa Primary School" }],
  openGraph: {
    title: "Peihwa Primary School",
    description: "Nurturing Young Minds, Building Bright Futures",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
