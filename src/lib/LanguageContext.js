"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

/**
 * Reads the preferred locale synchronously from localStorage.
 * Safe to call during useState initializer — falls back to "ms" on SSR
 * (where localStorage is undefined) so there's no server/client mismatch.
 */
function getInitialLocale() {
  if (typeof window === "undefined") return "ms"; // SSR guard
  const saved = localStorage.getItem("preferredLocale");
  if (!saved || saved === "en") {
    // Normalise legacy "en" value
    localStorage.setItem("preferredLocale", "ms");
    return "ms";
  }
  return saved;
}

export function LanguageProvider({ children }) {
  // Initialise locale synchronously so the first fetch always targets the
  // correct language — eliminates the "ms → zh" flicker on refresh.
  const [locale, setLocale] = useState(getInitialLocale);
  const [translations, setTranslations] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [translationsReady, setTranslationsReady] = useState(false);

  // Mark as mounted after first paint (client-only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load translations whenever the locale is known and the component is mounted
  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;
    setTranslationsReady(false);

    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${locale}`);
        }
        const data = await response.json();
        if (!cancelled) {
          setTranslations(data);
          setTranslationsReady(true);
        }
      } catch (error) {
        console.error("Error loading translations:", error);
        // Fallback to 'ms' if other locale fails
        if (locale !== "ms" && !cancelled) {
          console.log("Falling back to 'ms' translations");
          try {
            const fallbackResponse = await fetch("/locales/ms/common.json");
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (!cancelled) {
                setTranslations(fallbackData);
                setTranslationsReady(true);
                return; // Exit here as we transitioned successfully
              }
            }
          } catch (fallbackError) {
            console.error(
              "Critical error: Could not load fallback translations",
              fallbackError,
            );
          }
        }

        // Final safety: if we're already on 'ms' OR the fallback above failed,
        // we MUST set translationsReady to true so the loader doesn't stick.
        if (!cancelled) {
          setTranslations({});
          setTranslationsReady(true);
        }
      }
    };

    loadTranslations();

    // Cleanup: ignore stale fetches when locale changes mid-flight
    return () => {
      cancelled = true;
    };
  }, [locale, isMounted]);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem("preferredLocale", newLocale);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        translations,
        changeLocale,
        isMounted,
        translationsReady,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
