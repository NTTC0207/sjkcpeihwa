"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import {
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdInstallMobile,
  MdNotifications,
  MdNotificationsOff,
  MdCheckCircle,
} from "react-icons/md";
import { HiArrowRight, HiMail } from "react-icons/hi";
import { useState, useEffect, useCallback } from "react";

/**
 * Footer Component
 * Features:
 * - Contact information
 * - Quick links
 * - Social media links
 * - PWA Install prompt
 * - Push notification subscription
 * - Responsive layout
 * - Brand colors from Peihwa logo
 */
export default function Footer({ translations }) {
  const t = translations;

  // --- PWA Install State ---
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installState, setInstallState] = useState("idle"); // "idle" | "installing" | "installed" | "unsupported"

  // --- Notifications State ---
  const [notifState, setNotifState] = useState("idle"); // "idle" | "enabled" | "denied" | "unsupported"

  useEffect(() => {
    // Check if already installed (display-mode: standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstallState("installed");
    }

    // Capture the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallState("idle");
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful installation
    const installedHandler = () => setInstallState("installed");
    window.addEventListener("appinstalled", installedHandler);

    // Check notification permission on mount
    if (!("Notification" in window)) {
      setNotifState("unsupported");
    } else if (Notification.permission === "granted") {
      setNotifState("enabled");
    } else if (Notification.permission === "denied") {
      setNotifState("denied");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    setInstallState("installing");
    try {
      const result = await installPrompt.prompt();
      if (result?.outcome === "accepted") {
        setInstallState("installed");
      } else {
        setInstallState("idle");
      }
    } catch {
      setInstallState("idle");
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  const handleNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      setNotifState("unsupported");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifState("enabled");
        // Optionally show a confirmation notification
        new Notification(t?.nav?.name || "SJK(C) Pei Hwa", {
          body:
            t?.footer?.pwa?.notificationsEnabled || "Notifications enabled ✓",
          icon: "/icon-192x192.png",
        });
      } else if (permission === "denied") {
        setNotifState("denied");
      }
    } catch {
      setNotifState("unsupported");
    }
  }, [t]);

  // --- Install button appearance ---
  const installButtonConfig = () => {
    if (installState === "installed") {
      return {
        label: t?.footer?.pwa?.installed || "App Installed ✓",
        icon: <MdCheckCircle className="text-lg" />,
        disabled: true,
        className:
          "bg-green-700/30 border border-green-500/50 text-green-300 cursor-default",
      };
    }
    if (installState === "installing") {
      return {
        label: t?.footer?.pwa?.installing || "Installing...",
        icon: <MdInstallMobile className="text-lg animate-pulse" />,
        disabled: true,
        className:
          "bg-accent-yellow/10 border border-accent-yellow/40 text-accent-yellow/80 cursor-wait",
      };
    }
    if (!installPrompt && installState !== "installed") {
      // Not installable (already installed via browser, or browser auto-dismissed, or not supported)
      return {
        label: t?.footer?.pwa?.install || "Install App",
        icon: <MdInstallMobile className="text-lg" />,
        disabled: true,
        className:
          "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50",
      };
    }
    return {
      label: t?.footer?.pwa?.install || "Install App",
      icon: <MdInstallMobile className="text-lg" />,
      disabled: false,
      className:
        "bg-accent-yellow/10 border border-accent-yellow/40 text-accent-yellow hover:bg-accent-yellow/20 hover:border-accent-yellow/70 transition-all duration-300 cursor-pointer",
    };
  };

  // --- Notification button appearance ---
  const notifButtonConfig = () => {
    if (notifState === "enabled") {
      return {
        label: t?.footer?.pwa?.notificationsEnabled || "Notifications Active ✓",
        icon: <MdCheckCircle className="text-lg" />,
        disabled: true,
        className:
          "bg-green-700/30 border border-green-500/50 text-green-300 cursor-default",
      };
    }
    if (notifState === "denied") {
      return {
        label: t?.footer?.pwa?.notificationsDenied || "Notifications Blocked",
        icon: <MdNotificationsOff className="text-lg" />,
        disabled: true,
        className:
          "bg-red-900/20 border border-red-700/30 text-red-400 cursor-not-allowed opacity-60",
      };
    }
    if (notifState === "unsupported") {
      return {
        label: t?.footer?.pwa?.notificationsUnsupported || "Not Supported",
        icon: <MdNotificationsOff className="text-lg" />,
        disabled: true,
        className:
          "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50",
      };
    }
    return {
      label: t?.footer?.pwa?.notifications || "Enable Notifications",
      icon: <MdNotifications className="text-lg" />,
      disabled: false,
      className:
        "bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300 cursor-pointer",
    };
  };

  const installBtn = installButtonConfig();
  const notifBtn = notifButtonConfig();

  const quickLinks = [
    { href: "/", label: t?.nav?.home || "Home" },
    {
      href: "/profile/history",
      label: t?.nav?.profile?.calendar || "School History",
    },
    {
      href: "/announcements",
      label: t?.nav?.announcements || "Announcements",
    },
    {
      href: "/organization?view=chart",
      label: t?.nav?.organization?.chart || "Organization Chart",
    },
    { href: "/#contact", label: t?.nav?.contact || "Contact Us" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      href: "https://www.facebook.com/sjkcpeihwa.machang",
      color: "hover:text-blue-600",
    },
    {
      name: "YouTube",
      icon: <FaYoutube />,
      href: "https://www.youtube.com/@SJKCPEIHWAMACHANG",
      color: "hover:text-red-600",
    },
    {
      name: "Email",
      icon: <HiMail />,
      href: "mailto:dbc2185@moe.edu.my",
      color: "hover:text-accent-yellow",
    },
  ];

  return (
    <footer className="bg-primary-dark text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Peihwa Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">
                  SJK(C) Pei Hwa
                </h3>
                <p className="text-sm text-gray-300">Machang</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t?.hero?.motto ||
                "Nurturing Young Minds, Building Bright Futures"}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-accent-yellow">
              {t?.footer?.contact || "Contact Us"}
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <MdLocationOn className="mr-2 mt-1 text-accent-yellow text-lg" />
                <a
                  href="https://www.google.com/maps/place/SJK(C)+Pei+Hwa/@5.7651017,102.2206205,17z/data=!3m1!4b1!4m6!3m5!1s0x31b685332f7428b9:0x9723d38c28a38913!8m2!3d5.7650964!4d102.2231954!16s%2Fg%2F122np819?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-yellow transition-colors duration-300"
                >
                  <span>
                    {t?.footer?.address ||
                      "123 Education Street, Learning District"}
                  </span>
                </a>
              </li>
              <li className="flex items-center">
                <MdPhone className="mr-2 text-accent-yellow text-lg" />
                <span>{t?.footer?.phone || "Phone: +60 9-9751046"}</span>
              </li>
              <li className="flex items-center">
                <MdEmail className="mr-2 text-accent-yellow text-lg" />
                <span>{t?.footer?.email || "Email: dbc2185@moe.edu.my"}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-accent-yellow">
              {t?.footer?.quickLinks || "Quick Links"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-accent-yellow transition-colors duration-300 text-sm flex items-center group"
                  >
                    <HiArrowRight className="mr-2 text-[10px] transition-transform duration-300 group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media + PWA / Notifications */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-accent-yellow">
              {t?.footer?.followUs || "Follow Us"}
            </h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl transition-all duration-300 hover:scale-125 ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-300 mb-1">
                {t?.footer?.hours || "School Hours:"}
              </p>
              <p className="text-sm text-gray-400">
                {t?.footer?.days || "Sun - Thu: 7:30 AM - 4:30 PM"}
              </p>
            </div>

            {/* PWA Section */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                {t?.footer?.pwa?.description ||
                  "Install our app for quick access and receive the latest school notifications."}
              </p>
              <div className="flex flex-col gap-2">
                {/* Install App Button */}
                <button
                  id="footer-pwa-install-btn"
                  onClick={installBtn.disabled ? undefined : handleInstall}
                  disabled={installBtn.disabled}
                  aria-label={installBtn.label}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium ${installBtn.className}`}
                >
                  {installBtn.icon}
                  <span>{installBtn.label}</span>
                </button>

                {/* Enable Notifications Button */}
                <button
                  id="footer-pwa-notify-btn"
                  onClick={notifBtn.disabled ? undefined : handleNotifications}
                  disabled={notifBtn.disabled}
                  aria-label={notifBtn.label}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium ${notifBtn.className}`}
                >
                  {notifBtn.icon}
                  <span>{notifBtn.label}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="text-sm text-gray-400">
            {t?.footer?.copyright
              ? t.footer.copyright.replace("{{year}}", new Date().getFullYear())
              : `© ${new Date().getFullYear()} SJK(C) Pei Hwa Machang. All rights reserved.`}
          </p>
          <Link
            href="/privacy"
            className="text-sm text-gray-400 hover:text-accent-yellow transition-colors duration-300 underline underline-offset-2"
          >
            Dasar Privasi · 隐私政策 · Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
