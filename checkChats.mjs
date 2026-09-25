import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

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

async function checkData() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  for (const userDoc of snapshot.docs) {
    const uid = userDoc.id;
    console.log(`User: ${uid}`);
    const sessionsRef = collection(db, 'users', uid, 'sessions');
    const sessionsSnap = await getDocs(sessionsRef);
    console.log(`  - Sessions count: ${sessionsSnap.size}`);
    sessionsSnap.docs.forEach(d => {
      console.log(`    - ${d.id}: ${d.data().title}`);
    });
  }
  process.exit(0);
}

checkData().catch(err => console.error(err));
