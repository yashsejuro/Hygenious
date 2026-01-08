// Firebase Configuration and Initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Get these values from Firebase Console: Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only if not already initialized)
let app;
let auth;

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize Firebase Authentication
  auth = getAuth(app);
} else {
  // During build or if env vars are missing, we skip initialization
  // to prevent 'auth/invalid-api-key' errors.
  // This allows the build to complete without credentials.
  console.warn("⚠️ Firebase not initialized: Missing NEXT_PUBLIC_FIREBASE_API_KEY");
  app = null;
  auth = null; 
}

export { auth };
export default app;

