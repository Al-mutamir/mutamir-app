import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5Xq2mTtaK9NMAxKv6RHQoFFpyCBI2-Ps",
  authDomain: "al-mutamir.firebaseapp.com",
  projectId: "al-mutamir",
  storageBucket: "al-mutamir.appspot.com",
  messagingSenderId: "943450810343",
  appId: "1:943450810343:web:ff66f9192909aa5e4b7f42",
  measurementId: "G-79E3MHKNQD",
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
