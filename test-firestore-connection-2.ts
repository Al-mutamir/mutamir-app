import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5Xq2mTtaK9NMAxKv6RHQoFFpyCBI2-Ps",
  authDomain: "almutamir.firebaseapp.com",
  projectId: "almutamir",
  storageBucket: "almutamir.appspot.com",
  messagingSenderId: "943450810343",
  appId: "1:943450810343:web:ff66f9192909aa5e4b7f42",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  console.log("Attempting to connect and write to Firestore...");
  try {
    const testRef = collection(db, "test_notifications");
    const docRef = await addDoc(testRef, {
      message: "Test notification from CLI",
      timestamp: serverTimestamp(),
    });
    console.log("SUCCESS! Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("ERROR writing document: ", e);
  }
}

testConnection().then(() => process.exit(0));
