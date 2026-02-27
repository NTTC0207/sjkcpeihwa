"use client";

import { LanguageProvider, useLanguage } from "../lib/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CookieNotice from "../components/CookieNotice";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";

function LayoutContent({ children }) {
  const { translations, locale, changeLocale, isMounted } = useLanguage();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // Local state to ensure hydration matching.
  // Context state might have already transitioned if this component was suspended.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // During hydration (mounted === false), always treat as loading to match server.
  const isLoading = !mounted || !isMounted || !translations;

  if (isAdmin) {
    return (
      <>
        {isLoading && (
          <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!isLoading && children}
      </>
    );
  }

  return (
    <>
      <Navbar
        translations={translations}
        currentLocale={locale}
        onLocaleChange={changeLocale}
        isMounted={isMounted}
      />

      {/* 
        Hydration Safety: We render both the children and the spinner during the 
        initial pass to ensure the server and client HTML match exactly. 
        Once mounted and translated, we remove the spinner and show the content.
      */}
      {isLoading && (
        <main className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-neutral-bg">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      )}

      {!isLoading && children}

      <Footer translations={translations} isMounted={isMounted} />
      <CookieNotice />
    </>
  );
}

export default function ClientLayout({ children }) {
  return (
    <LanguageProvider>
      <Suspense fallback={null}>
        <LayoutContent>{children}</LayoutContent>
      </Suspense>
    </LanguageProvider>
  );
}
