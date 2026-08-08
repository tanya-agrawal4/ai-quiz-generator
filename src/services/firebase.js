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

export {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
}
