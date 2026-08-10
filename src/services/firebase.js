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
// Reads environment variables with .trim() to guard against whitespace issues
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
}

// ─── Debug: Log whether env vars loaded (safe — never logs actual values) ───
console.log('[Firebase] Config check:', {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
})

// Placeholder / demo values that should be treated as "not configured"
const PLACEHOLDER_VALUES = [
  'YOUR_FIREBASE_API_KEY_HERE',
  'AIzaSyDemoKeyQuizForgeBaaS2026',
  '',
]

const isConfigured = firebaseConfig.apiKey &&
  !PLACEHOLDER_VALUES.includes(firebaseConfig.apiKey)

// ─── Firebase Configuration Validation ───────────────────────────────────
// Warn loudly if Firebase is using fallback/demo credentials
if (!isConfigured) {
  console.warn(
    '%c⚠️ FIREBASE CONFIG MISSING — Multiplayer rooms will NOT work!\n' +
    'Set VITE_FIREBASE_* variables in your .env file with real Firebase project credentials.\n' +
    'See: https://console.firebase.google.com → Project Settings → Your apps → Web config',
    'color: #ff4444; font-weight: bold; font-size: 13px; background: #fff3f3; padding: 8px; border-radius: 4px;'
  )
}
// ─────────────────────────────────────────────────────────────────────────

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Initialize Firestore Instance
const db = getFirestore(app)

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
  isConfigured,
}
