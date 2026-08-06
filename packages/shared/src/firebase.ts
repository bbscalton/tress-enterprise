import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'fleetrentals-app.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://fleetrentals-app-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'fleetrentals-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'fleetrentals-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'YOUR_APP_ID',
};

let app: FirebaseApp;
let auth: Auth;
let db: Database;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
    storage = getStorage(app);
  }
  return { app, auth, db, storage };
}

export async function initMessaging() {
  if (messaging) return messaging;
  const supported = await isSupported();
  if (!supported) return null;
  const { app: firebaseApp } = initFirebase();
  messaging = getMessaging(firebaseApp);
  return messaging;
}

export function getFirebaseAuth() {
  return initFirebase().auth;
}

export function getFirebaseDb() {
  return initFirebase().db;
}

export function getFirebaseStorage() {
  return initFirebase().storage;
}

export { firebaseConfig };
