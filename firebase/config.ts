import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5Xq2mTtaK9NMAxKv6RHQoFFpyCBI2-Ps",
  authDomain: "Almutamir.firebaseapp.com",
  projectId: "Almutamir",
  storageBucket: "Almutamir.appspot.com",
  messagingSenderId: "943450810343",
  appId: "1:943450810343:web:ff66f9192909aa5e4b7f42",
  measurementId: "G-79E3MHKNQD",
}

// Initialize Firebase with proper error handling
let firebaseApp
let firebaseAuth
let firebaseDb

try {
  // Initialize the Firebase app if it hasn't been initialized yet
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
  } else {
    firebaseApp = getApp()
  }

  // Initialize Firebase auth
  firebaseAuth = getAuth(firebaseApp)

  // Initialize Firestore
  firebaseDb = getFirestore(firebaseApp)

  console.log("Firebase initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)

  // Set fallback values if initialization fails
  firebaseApp = null
  firebaseAuth = null
  firebaseDb = null
}

export const app = firebaseApp
export const auth = firebaseAuth
export const db = firebaseDb
