"use client";

import Link from "next/link";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
import {
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdInstallMobile,
  MdNotifications,
  MdNotificationsOff,
  MdCheckCircle,
  MdClose,
  MdIosShare,
} from "react-icons/md";
import { HiArrowRight, HiMail } from "react-icons/hi";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  requestNotificationPermission,
  saveFCMToken,
} from "@/src/lib/firebase";

/* ─────────────────────────────────────────
   Helper: detect iOS (no beforeinstallprompt)
───────────────────────────────────────── */
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  );
}

/* ─────────────────────────────────────────
   iOS "Add to Home Screen" modal
───────────────────────────────────────── */
function IOSInstallModal({ onClose, translations: t }) {
  const modalRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div
        ref={modalRef}
        className="w-full max-w-sm bg-gray-900 border border-white/15 rounded-2xl p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0 relative">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain p-1"
            />
          </div>
          <div>
            <p className="font-bold text-white text-sm">SJKC Pei Hwa</p>
            <p className="text-xs text-gray-400">Install the App on iOS</p>
          </div>
        </div>

        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-yellow/20 text-accent-yellow text-xs flex items-center justify-center font-bold mt-0.5">
              1
            </span>
            <span>
              Tap the{" "}
              <MdIosShare className="inline text-blue-400 text-base align-text-bottom" />{" "}
              <strong className="text-white">Share</strong> button at the bottom
              of Safari.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-yellow/20 text-accent-yellow text-xs flex items-center justify-center font-bold mt-0.5">
              2
            </span>
            <span>
              Scroll down and tap{" "}
              <strong className="text-white">"Add to Home Screen"</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-yellow/20 text-accent-yellow text-xs flex items-center justify-center font-bold mt-0.5">
              3
            </span>
            <span>
              Tap <strong className="text-white">Add</strong> — the app icon
              will appear on your home screen!
            </span>
          </li>
        </ol>

        <p className="mt-4 text-xs text-gray-500 text-center">
          (Works in Safari · iOS 16.4+ required for notifications)
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Footer Component
───────────────────────────────────────── */
export default function Footer({ translations, isMounted }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = mounted && isMounted ? translations : null;

  // PWA / platform state
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Android install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installState, setInstallState] = useState("checking"); // "checking"|"idle"|"installing"|"installed"|"unsupported"

  // Notifications
  const [notifState, setNotifState] = useState("idle"); // "idle"|"enabled"|"denied"|"unsupported"|"pwa-required"

  useEffect(() => {
    const onIOS = isIOS();
    const inStandalone = isInStandaloneMode();
    setIos(onIOS);
    setStandalone(inStandalone);

    if (inStandalone) {
      // Already installed as PWA
      setInstallState("installed");
    } else if (onIOS) {
      // iOS: no beforeinstallprompt; show manual guide instead
      setInstallState("ios");
    } else {
      // Android / Desktop: wait for beforeinstallprompt
      setInstallState("checking");
    }

    // Capture the Android/Chrome install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallState("idle");
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Fired after successful install
    const installedHandler = () => {
      setInstallState("installed");
      setStandalone(true);
    };
    window.addEventListener("appinstalled", installedHandler);

    // If not iOS and no prompt fires within 3s, mark as unsupported/already-installed
    let timeout;
    if (!onIOS && !inStandalone) {
      timeout = setTimeout(() => {
        setInstallState((prev) => (prev === "checking" ? "unsupported" : prev));
      }, 3000);
    }

    // ── Notification / Push state detection ──────────────────────
    // iOS in browser (not installed): Notification API may exist on iOS 16.4+
    // but PushManager is only available in standalone (installed) mode.
    const hasPushManager = "PushManager" in window;
    const hasNotification = "Notification" in window;
    const isSecure = window.isSecureContext;

    if (!isSecure) {
      console.warn(
        "FCM Warning: This is NOT a secure context. Notifications/ServiceWorkers will only work on localhost or HTTPS.",
      );
    }

    if (onIOS && !inStandalone) {
      // iOS browser — must install first before push works
      setNotifState("pwa-required");
    } else if (!hasNotification || !hasPushManager) {
      // Very old browser or unsupported environment
      console.warn("FCM Unsupported: Notification or PushManager missing.");
      setNotifState("unsupported");
    } else if (Notification.permission === "granted") {
      setNotifState("enabled");
    } else if (Notification.permission === "denied") {
      setNotifState("denied");
    }
    // else: "default" — leave as "idle" so user can tap to enable

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(timeout);
    };
  }, []);

  // Watch standalone changes (e.g., user installed mid-session)
  useEffect(() => {
    if (standalone && notifState === "pwa-required") {
      setNotifState("idle");
    }
  }, [standalone, notifState]);

  // AUTO-TRIGGER: If permission is already granted, try to get the token immediately
  // so the user doesn't have to click a disabled button.
  // useEffect(() => {
  //   if (notifState === "enabled") {
  //     console.log("FCM: Permission already granted. Refreshing token...");
  //     handleNotifications();
  //   }
  // }, [notifState, handleNotifications]);

  /* ── Install handler ── */
  const handleInstall = useCallback(async () => {
    if (ios) {
      setShowIOSModal(true);
      return;
    }
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
  }, [ios, installPrompt]);

  /* ── Notification handler (FCM — works on Android + iOS 16.4+ PWA) ── */
  const handleNotifications = useCallback(async () => {
    console.log("Starting notification registration...");
    setNotifState("loading");

    try {
      const token = await requestNotificationPermission();

      if (token) {
        console.log("FCM Token acquired:", token);
        // Persist the token so the server can send real push notifications
        await saveFCMToken(token);
        setNotifState("enabled");

        // Show a local confirmation toast via Service Worker
        // (Necessary for mobile where new Notification() is often blocked)
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && "showNotification" in registration) {
            registration.showNotification(t?.nav?.name || "SJKC Pei Hwa", {
              body:
                t?.footer?.pwa?.notificationsEnabled ||
                "Notifications enabled ✓",
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
            });
          }
        }
      } else {
        // If token is null, it could be because permission was denied OR missing VAPID key
        const permission = Notification.permission;
        console.log("Notification permission state:", permission);

        if (permission === "denied") {
          setNotifState("denied");
        } else {
          // Could be "default" (dismissed) or internal error (like missing VAPID)
          setNotifState("idle");

          // On iOS, if nothing happens, it's often confusing.
          // If we are here and permission is STILL default, it means the dialog didn't show or was dismissed.
          if (permission === "default") {
            console.warn(
              "Notification permission dialog was dismissed or not shown.",
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in handleNotifications:", error);
      setNotifState("unsupported");
    }
  }, [t]);

  /* ── Install button config ── */
  const installBtn = (() => {
    switch (installState) {
      case "installed":
        return {
          label: t?.footer?.pwa?.installed || "App Installed ✓",
          icon: <MdCheckCircle className="text-lg flex-shrink-0" />,
          disabled: true,
          className:
            "bg-green-700/30 border border-green-500/50 text-green-300 cursor-default",
        };
      case "installing":
        return {
          label: t?.footer?.pwa?.installing || "Installing...",
          icon: (
            <MdInstallMobile className="text-lg flex-shrink-0 animate-pulse" />
          ),
          disabled: true,
          className:
            "bg-accent-yellow/10 border border-accent-yellow/40 text-accent-yellow/80 cursor-wait",
        };
      case "ios":
        return {
          label: t?.footer?.pwa?.install || "Install App",
          icon: <MdIosShare className="text-lg flex-shrink-0" />,
          disabled: false,
          className:
            "bg-accent-yellow/10 border border-accent-yellow/40 text-accent-yellow hover:bg-accent-yellow/20 hover:border-accent-yellow/70 transition-all duration-300 cursor-pointer",
        };
      case "idle":
        return {
          label: t?.footer?.pwa?.install || "Install App",
          icon: <MdInstallMobile className="text-lg flex-shrink-0" />,
          disabled: false,
          className:
            "bg-accent-yellow/10 border border-accent-yellow/40 text-accent-yellow hover:bg-accent-yellow/20 hover:border-accent-yellow/70 transition-all duration-300 cursor-pointer",
        };
      case "checking":
        return {
          label: t?.footer?.pwa?.install || "Install App",
          icon: (
            <MdInstallMobile className="text-lg flex-shrink-0 opacity-50" />
          ),
          disabled: true,
          className:
            "bg-white/5 border border-white/10 text-gray-500 cursor-wait opacity-60",
        };
      default: // unsupported
        return {
          label: t?.footer?.pwa?.installed || "App Installed ✓",
          icon: <MdCheckCircle className="text-lg flex-shrink-0" />,
          disabled: true,
          className:
            "bg-green-700/30 border border-green-500/50 text-green-300 cursor-default",
        };
    }
  })();

  /* ── Notification button config ── */
  const notifBtn = (() => {
    switch (notifState) {
      case "enabled":
        return {
          label:
            t?.footer?.pwa?.notificationsEnabled || "Notifications Active ✓",
          icon: <MdCheckCircle className="text-lg flex-shrink-0" />,
          disabled: true,
          className:
            "bg-green-700/30 border border-green-500/50 text-green-300 cursor-default",
        };
      case "denied":
        return {
          label: t?.footer?.pwa?.notificationsDenied || "Notifications Blocked",
          icon: <MdNotificationsOff className="text-lg flex-shrink-0" />,
          disabled: true,
          className:
            "bg-red-900/20 border border-red-700/30 text-red-400 cursor-not-allowed opacity-60",
        };
      case "pwa-required":
        return {
          label: "Install App First for Notifications",
          icon: <MdInstallMobile className="text-lg flex-shrink-0" />,
          disabled: true,
          className:
            "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-70",
        };
      case "unsupported":
        return {
          label:
            t?.footer?.pwa?.notificationsUnsupported ||
            "Notifications Unsupported",
          icon: <MdNotificationsOff className="text-lg flex-shrink-0" />,
          disabled: true,
          className:
            "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50",
        };
      case "loading":
        return {
          label: "Enabling Notifications...",
          icon: (
            <MdNotifications className="text-lg flex-shrink-0 animate-pulse" />
          ),
          disabled: true,
          className:
            "bg-white/5 border border-white/15 text-gray-400 cursor-wait opacity-70",
        };
      default: // idle
        return {
          label: t?.footer?.pwa?.notifications || "Enable Notifications",
          icon: <MdNotifications className="text-lg flex-shrink-0" />,
          disabled: false,
          className:
            "bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300 cursor-pointer",
        };
    }
  })();

  const quickLinks = [
    { href: "/", label: t?.nav?.home || "Home" },
    {
      href: "/profile/history",
      label: t?.nav?.profile?.calendar || "School History",
    },
    { href: "/announcements", label: t?.nav?.announcements || "Announcements" },
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
      color: "hover:text-blue-500",
    },
    {
      name: "YouTube",
      icon: <FaYoutube />,
      href: "https://www.youtube.com/@SJKCPEIHWAMACHANG",
      color: "hover:text-red-500",
    },
    {
      name: "Email",
      icon: <HiMail />,
      href: "mailto:dbc2185@moe.edu.my",
      color: "hover:text-accent-yellow",
    },
  ];

  return (
    <>
      {showIOSModal && (
        <IOSInstallModal
          onClose={() => setShowIOSModal(false)}
          translations={t}
        />
      )}

      <footer className="bg-primary-dark text-white">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* School Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm relative">
                  <Image
                    src="/logo.png"
                    alt="Peihwa Logo"
                    width={48}
                    height={48}
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">
                    SJKC Pei Hwa
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
                    href="https://www.google.com/maps/place/SJKC+Pei+Hwa/@5.7651017,102.2206205,17z/data=!3m1!4b1!4m6!3m5!1s0x31b685332f7428b9:0x9723d38c28a38913!8m2!3d5.7650964!4d102.2231954!16s%2Fg%2F122np819?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-yellow transition-colors duration-300"
                  >
                    <span>
                      {t?.footer?.address ||
                        "18500 Machang, Kelantan, Malaysia"}
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

            {/* Social + PWA */}
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

              {/* ── PWA Section ── */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  {t?.footer?.pwa?.description ||
                    "Install our app for quick access and receive the latest school notifications."}
                </p>
                <div className="flex flex-col gap-2">
                  {/* Install App */}
                  <button
                    id="footer-pwa-install-btn"
                    onClick={installBtn.disabled ? undefined : handleInstall}
                    disabled={installBtn.disabled}
                    aria-label={installBtn.label}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium ${installBtn.className}`}
                  >
                    {installBtn.icon}
                    <span className="truncate">{installBtn.label}</span>
                  </button>

                  {/* Enable Notifications */}
                  <button
                    id="footer-pwa-notify-btn"
                    onClick={
                      notifBtn.disabled ? undefined : handleNotifications
                    }
                    disabled={notifBtn.disabled}
                    aria-label={notifBtn.label}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium ${notifBtn.className}`}
                  >
                    {notifBtn.icon}
                    <span className="truncate">{notifBtn.label}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
            <p className="text-sm text-gray-400">
              {t?.footer?.copyright
                ? t.footer.copyright.replace(
                    "{{year}}",
                    new Date().getFullYear(),
                  )
                : `© ${new Date().getFullYear()} SJKC Pei Hwa Machang. All rights reserved.`}
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
    </>
  );
}
