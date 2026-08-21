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
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

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

// Firebase is considered configured if a non-empty API key is present
const isConfigured = !!firebaseConfig.apiKey

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

// ─── Safe Firebase Initialization ────────────────────────────────────────
// When VITE_FIREBASE_API_KEY is missing (e.g. on Vercel without env vars),
// initializeAuth throws a fatal synchronous 'auth/invalid-api-key' error
// that crashes the entire module import chain and prevents React from
// mounting (White Screen of Death). We wrap everything in try-catch so the
// app degrades gracefully — auth/multiplayer features become unavailable
// but the rest of the UI still renders.
let app = null
let db = null
let auth = null

try {
  // Initialize Firebase App
  app = initializeApp(firebaseConfig)

  // Initialize Firestore Instance
  db = getFirestore(app)

  // Initialize Firebase Auth Instance (with HMR-safe fallback)
  try {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    })
  } catch {
    // During Vite HMR, auth may already be initialized — use getAuth as fallback
    auth = getAuth(app)
  }
} catch (err) {
  console.error(
    '[Firebase] ❌ Fatal initialization error — Firebase features will be unavailable:',
    err.message || err
  )
}
// ─────────────────────────────────────────────────────────────────────────

export {
  db,
  auth,
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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
}

