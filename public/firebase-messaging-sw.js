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
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload,
  );

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "SJKC Pei Hwa";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "New notification from SJKC Pei Hwa",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: payload.data || {},
    // Show the notification even if a client is focused (good for iOS)
    requireInteraction: false,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification click — open/focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
