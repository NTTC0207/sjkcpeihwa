// Firebase Cloud Messaging Service Worker
// This file MUST be at the root (public/) so Firebase can register it.
// It handles background push notifications for both Android and iOS 16.4+ PWA.

importScripts(
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js",
);

// ── Firebase config ──────────────────────────────────────────────
// These values are SAFE to expose in a service worker (they are already
// public-facing in your Next.js NEXT_PUBLIC_ env vars).
const firebaseConfig = {
  apiKey: "AIzaSyCxYQfFgCghAl2FubDTKUEpMZosBc4gPZs",
  authDomain: "peihwa-3ca3b.firebaseapp.com",
  projectId: "peihwa-3ca3b",
  storageBucket: "peihwa-3ca3b.firebasestorage.app",
  messagingSenderId: "690162935351",
  appId: "1:690162935351:web:35320c599d1a524014c1b2",
};

console.log("Firebase config:", firebaseConfig);

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages (when the app is not in the foreground)
// 1. Listen for background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload,
  );

  const notification = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = notification.title || data.title || "SJKC Pei Hwa";
  const notificationOptions = {
    body: notification.body || data.body || "Ada pengumuman baru untuk anda!",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "announcement-notification",
    renotify: true,
    data: {
      url: data.url || "/announcements",
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// 2. Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If a tab is already open, focus it and navigate
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// 3. Force service worker to take control immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
