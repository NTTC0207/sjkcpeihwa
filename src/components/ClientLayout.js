"use client";

import { LanguageProvider, useLanguage } from "../lib/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CookieNotice from "../components/CookieNotice";
import SmoothScroll from "../components/SmoothScroll";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";

// ─── Splash Loader ───────────────────────────────────────────────────────────
function SplashLoader() {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-bg"
    >
      {/* Logo */}
      <motion.img
        src="/logo.png"
        alt="SJKC Pei Hwa"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-24 h-24 object-contain mb-8 drop-shadow-xl"
      />

      {/* School name */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-primary font-display font-bold text-lg tracking-widest uppercase mb-8"
      >
        SJKC Pei Hwa
      </motion.p>

      {/* Animated progress bar */}
      <div className="w-48 h-1 rounded-full bg-primary/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

// ─── Layout Content ───────────────────────────────────────────────────────────
function LayoutContent({ children }) {
  const { translations, locale, changeLocale, isMounted, translationsReady } =
    useLanguage();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // Local state to ensure hydration matching.
  const [mounted, setMounted] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Safety timeout: if loader is stuck for > 8s, force show content
    const timer = setTimeout(() => {
      setForceShow(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Show loader until translations for the correct locale are fully loaded.
  // - !mounted       → SSR / first paint, hide content to prevent mismatch
  // - !translationsReady → locale file still fetching
  const isLoading =
    (!mounted || !isMounted || !translationsReady || !translations) &&
    !forceShow;

  if (isAdmin) {
    return (
      <>
        <AnimatePresence>
          {isLoading && <SplashLoader key="admin-splash" />}
        </AnimatePresence>
        {!isLoading && children}
      </>
    );
  }

  return (
    <SmoothScroll>
      <Navbar
        translations={translations}
        currentLocale={locale}
        onLocaleChange={changeLocale}
        isMounted={isMounted}
      />

      <AnimatePresence>
        {isLoading && <SplashLoader key="page-splash" />}
      </AnimatePresence>

      {/* Render children only after translations are ready */}
      {!isLoading && children}

      <Footer translations={translations} isMounted={isMounted} />
      <CookieNotice />
    </SmoothScroll>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function ClientLayout({ children }) {
  return (
    <LanguageProvider>
      <Suspense fallback={null}>
        <LayoutContent>{children}</LayoutContent>
      </Suspense>
    </LanguageProvider>
  );
}
