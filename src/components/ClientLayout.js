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

  if (!isMounted || !translations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
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
