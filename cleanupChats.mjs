import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAP9rXOO6di6KFjUQvt0NEFMnSEeLjwwMU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sahityaka-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sahityaka-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sahityaka-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "149061229841",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:149061229841:web:739e98ad3f58dc4e7bc0b0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanup() {
  console.log("Cleaning up sahityaka...");
  const sahityakaRef = collection(db, 'users', 'sahityaka', 'sessions');
  const sSnap = await getDocs(sahityakaRef);
  for (const d of sSnap.docs) {
    if (d.id.startsWith("chat_") || d.data().title === "New Chat") {
      await deleteDoc(d.ref);
      console.log(`Deleted from sahityaka: ${d.id}`);
    }
  }

  console.log("Cleaning up general_user_general...");
  const gRef = collection(db, 'users', 'general_user_general', 'sessions');
  const gSnap = await getDocs(gRef);
  for (const d of gSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted from general_user_general: ${d.id}`);
  }
  
  process.exit(0);
}

cleanup().catch(err => console.error(err));
