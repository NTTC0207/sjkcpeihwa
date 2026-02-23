// Firebase configuration and initialization

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize core Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Get Firebase Cloud Messaging instance (client-side only).
 * Dynamically imported to avoid SSR issues.
 * Returns null if messaging is not supported in this environment.
 */
export async function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  try {
    const { getMessaging, isSupported } = await import("firebase/messaging");
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

/**
 * Request notification permission and get an FCM token.
 * Works on:
 *  - Android Chrome (browser + installed PWA)
 *  - iOS 16.4+ installed PWA (Safari-based)
 *
 * @returns {Promise<string|null>} FCM token or null if unavailable/denied.
 */
export async function requestNotificationPermission() {
  // 1. Check if the Notification API is available
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications are not supported in this browser.");
    return null;
  }

  // 2. Request permission (MUST be called directly from user gesture for iOS)
  let permission = Notification.permission;
  if (permission === "default") {
    try {
      permission = await Notification.requestPermission();
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return null;
    }
  }

  if (permission !== "granted") {
    console.log("Notification permission was not granted:", permission);
    return null;
  }

  // 3. Now that we have permission, we can proceed with FCM-specific setup
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn(
      "NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set. Cannot get FCM token.",
    );
    // We still have permission, but we can't get a token to send push notifications.
    return null;
  }

  // 4. Register / verify the FCM service worker
  let swReg;
  try {
    // Wait for SW to be ready
    swReg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
        updateViaCache: "none",
      },
    );

    // On some browsers, we might need to wait for the registration to be fully active
    await navigator.serviceWorker.ready;
  } catch (err) {
    console.error("FCM service worker registration failed:", err);
    return null;
  }

  // 5. Get the FCM push token
  try {
    const { getToken } = await import("firebase/messaging");
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn("Messaging instance could not be initialized.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });

    return token || null;
  } catch (err) {
    console.error("Failed to get FCM token:", err);
    return null;
  }
}

/**
 * Save an FCM token to Firestore under /fcmTokens/{token}.
 * This lets the server know which devices to push notifications to.
 */
export async function saveFCMToken(token) {
  if (!token) return;
  try {
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    await setDoc(
      doc(db, "fcmTokens", token),
      {
        token,
        platform: detectPlatform(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Failed to save FCM token:", err);
  }
}

function detectPlatform() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export default app;
