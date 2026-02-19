// Firebase configuration and initialization
// Replace these values with your actual Firebase project credentials

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
// TODO: Replace with your actual Firebase project credentials from Firebase Console
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCr5m7RiwfxkawGXv0lZgBEPtwK_zqEHW4",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "peihwa-cb1c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "peihwa-cb1c9",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "peihwa-cb1c9.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "985165580112",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:985165580112:web:40d4f51087990c20688e55",
};

// Initialize Firebase (singleton pattern)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
