import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase client instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId || undefined;

// Configure Firestore with long-polling enabled to resolve iframe/sandbox/proxy connection drops
// that cause "@firebase/firestore: Firestore (12.18.0): Could not reach Cloud Firestore backend"
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    databaseId
  );
} catch {
  // If already initialized, retrieve existing instance
  firestoreDb = getFirestore(app, databaseId);
}

export const db = firestoreDb;

export default app;

