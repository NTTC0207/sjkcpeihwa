"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("ms");
  const [translations, setTranslations] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("preferredLocale") || "en";
    setLocale(savedLocale);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`);
        if (!response.ok) {
          // throw new Error(`Failed to load translations for ${locale}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Error loading translations:", error);
        // Fallback to 'zh' if 'en' or other locale fails
        if (locale !== "zh") {
          console.log("Falling back to 'zh' translations");
          try {
            const fallbackResponse = await fetch("/locales/ms/common.json");
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setTranslations(fallbackData);
            }
          } catch (fallbackError) {
            console.error(
              "Critical error: Could not load fallback translations",
              fallbackError,
            );
          }
        }
      }
    };
    if (isMounted) {
      loadTranslations();
    }
  }, [locale, isMounted]);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem("preferredLocale", newLocale);
  };

  return (
    <LanguageContext.Provider
      value={{ locale, translations, changeLocale, isMounted }}
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
