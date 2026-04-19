import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Suppress Firestore internal GrpcConnection warnings in dev
setLogLevel('error');

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use long-polling to prevent connection unavailable errors in restricted browser spaces / iframes
export const db = !getApps().length ? initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId) : getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

async function testConnection() {
  try {
    const d = doc(db, 'test', 'connection');
    await getDocFromServer(d);
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
