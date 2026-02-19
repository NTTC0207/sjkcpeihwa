"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("en");
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
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Error loading translations:", error);
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
