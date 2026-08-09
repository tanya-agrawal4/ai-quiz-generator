import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore'

// Firebase Configuration Object
// Reads environment variables or falls back to demo project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyQuizForgeBaaS2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'quizforge-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'quizforge-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'quizforge-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:abcd1234efgh5678',
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Initialize Firestore Instance
const db = getFirestore(app)

// ─── Firebase Configuration Validation ───────────────────────────────────
// Warn loudly if Firebase is using fallback/demo credentials
if (
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_FIREBASE_API_KEY_HERE'
) {
  console.warn(
    '%c⚠️ FIREBASE CONFIG MISSING — Using demo fallback credentials. Multiplayer rooms will NOT work!\n' +
    'Set VITE_FIREBASE_* variables in your .env file with real Firebase project credentials.\n' +
    'See: https://console.firebase.google.com → Project Settings → Your apps → Web config',
    'color: #ff4444; font-weight: bold; font-size: 13px; background: #fff3f3; padding: 8px; border-radius: 4px;'
  )
}
// ─────────────────────────────────────────────────────────────────────────

export {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  collection,
  addDoc,
}
