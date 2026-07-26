import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebase-applet-config.json';

// Suppress Firestore internal GrpcConnection warnings in dev
setLogLevel('silent');

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  // If already initialized
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;

// Mock user for local development
const mockUser = {
  uid: "d3b07384-d113-4956-809e-206af520d0e2",
  email: "dev@example.com",
  displayName: "Dev Teacher",
  emailVerified: true,
  isAnonymous: false,
  providerData: [],
  getIdToken: async () => "mock-id-token"
};

export const auth = {
  currentUser: mockUser,
  onAuthStateChanged: (callback: any) => {
    if (typeof callback === 'function') {
      callback(mockUser);
    }
    return () => {};
  },
  onIdTokenChanged: (callback: any) => {
    if (typeof callback === 'function') {
      callback(mockUser);
    }
    return () => {};
  },
  signOut: async () => {},
  signInWithEmailAndPassword: async () => ({ user: mockUser }),
  createUserWithEmailAndPassword: async () => ({ user: mockUser })
} as any;

export const storage = getStorage(app);

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

if (typeof window !== 'undefined') {
  testConnection();
}
