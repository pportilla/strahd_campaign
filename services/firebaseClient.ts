import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

if (!isFirebaseConfigured) {
  console.warn('Firebase config is incomplete. Add all VITE_FIREBASE_* variables to your environment.');
}

export const firebaseApp = isFirebaseConfigured
  ? initializeApp(firebaseConfig, { automaticDataCollectionEnabled: false })
  : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const isFirestoreReady = Boolean(db);
