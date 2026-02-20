"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";

const cookieText = {
  ms: {
    message:
      "Kami menggunakan kuki analitik (Google Analytics) untuk memahami bagaimana pengunjung menggunakan laman web ini bagi tujuan penambahbaikan. Tiada maklumat peribadi dikumpul.",
    learnMore: "Dasar Privasi",
    accept: "Faham",
  },
  zh: {
    message:
      "我们使用 Google Analytics 分析 Cookie，以了解访客如何使用本网站，从而改善用户体验。我们不收集任何个人信息。",
    learnMore: "隐私政策",
    accept: "明白了",
  },
  en: {
    message:
      "We use Google Analytics cookies to understand how visitors use this site so we can improve it. No personal information is collected.",
    learnMore: "Privacy Policy",
    accept: "Got it",
  },
};

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const { locale } = useLanguage();

  useEffect(() => {
    const dismissed = localStorage.getItem("cookie-notice-dismissed");
    if (!dismissed) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("cookie-notice-dismissed", "true");
    setVisible(false);
  };

  const t = cookieText[locale] || cookieText.ms;

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "12px 16px",
        background: "linear-gradient(135deg, #123469 0%, #1a4993 100%)",
        borderTop: "3px solid #fec107",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
        animation: "slideUpCookie 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes slideUpCookie {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Icon + Message */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            flex: 1,
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>
            🍪
          </span>
          <p
            style={{
              color: "#e2e8f0",
              fontSize: "13.5px",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {t.message}{" "}
            <Link
              href="/privacy"
              style={{
                color: "#fec107",
                textDecoration: "underline",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {t.learnMore}
            </Link>
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          id="cookie-notice-accept-btn"
          onClick={handleDismiss}
          style={{
            background: "#fec107",
            color: "#123469",
            border: "none",
            borderRadius: "8px",
            padding: "8px 20px",
            fontWeight: 700,
            fontSize: "13.5px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "transform 0.15s, box-shadow 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
