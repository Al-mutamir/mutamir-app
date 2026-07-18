import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5Xq2mTtaK9NMAxKv6RHQoFFpyCBI2-Ps",
  authDomain: "Almutamir.firebaseapp.com",
  projectId: "Almutamir",
  storageBucket: "Almutamir.appspot.com",
  messagingSenderId: "943450810343",
  appId: "1:943450810343:web:ff66f9192909aa5e4b7f42",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCreate() {
  try {
    const bookingsRef = collection(db, "bookings");
    const docRef = await addDoc(bookingsRef, {
      test: "test",
      createdAt: serverTimestamp(),
    });
    console.log("Success:", docRef.id);
  } catch (e) {
    console.error("Error:", e);
  }
}

testCreate().then(() => process.exit(0));
