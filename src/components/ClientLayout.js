"use client";

import { LanguageProvider, useLanguage } from "../lib/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CookieNotice from "../components/CookieNotice";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function LayoutContent({ children }) {
  const { translations, locale, changeLocale, isMounted } = useLanguage();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // No longer blocking the entire layout with a loading spinner.
  // This improves LCP and initial paint by allowing the server-rendered HTML to show immediately.
  if (!isMounted || !translations) {
    // We can still return a shell or just the children.
    // Since Navbar and Footer have fallbacks, we can render them.
    if (isAdmin) return <>{children}</>;
    return (
      <>
        <Navbar
          translations={translations}
          currentLocale={locale}
          onLocaleChange={changeLocale}
        />
        {children}
        <Footer translations={translations} />
        <CookieNotice />
      </>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar
        translations={translations}
        currentLocale={locale}
        onLocaleChange={changeLocale}
      />
      {children}
      <Footer translations={translations} />
      <CookieNotice />
    </>
  );
}

export default function ClientLayout({ children }) {
  return (
    <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
    </LanguageProvider>
  );
}
